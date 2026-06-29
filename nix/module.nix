# NixOS module: services.nastech-workspace
#
# Runs the nastech-workspace web server as a systemd service.
# The companion nastech-agent gateway must be running separately
# (see https://github.com/nastech-ai/nastech-agent).
#
# Minimal NixOS configuration example:
#
#   services.nastech-workspace = {
#     enable = true;
#     nastechApiUrl = "http://127.0.0.1:8642";
#     # For remote access, set a password and open the port:
#     host = "0.0.0.0";
#     passwordFile = config.sops.secrets."nastech-workspace-password".path;
#   };
#   networking.firewall.allowedTCPPorts = [ 3000 ];
{
  config,
  lib,
  pkgs,
  ...
}:

let
  cfg = config.services.nastech-workspace;
  inherit (lib)
    mkEnableOption
    mkIf
    mkOption
    mkPackageOption
    types
    ;
in
{
  options.services.nastech-workspace = {
    enable = mkEnableOption "NasTech Workspace — web UI for NasTech Agent";

    package = mkPackageOption pkgs "nastech-workspace" { };

    port = mkOption {
      type = types.port;
      default = 3000;
      description = "TCP port the workspace server listens on.";
    };

    host = mkOption {
      type = types.str;
      default = "127.0.0.1";
      description = ''
        Address to bind the HTTP server to.
        Set to "0.0.0.0" to expose on all interfaces (requires passwordFile
        or allowInsecureRemote = true).
      '';
    };

    nastechApiUrl = mkOption {
      type = types.str;
      default = "http://127.0.0.1:8642";
      description = ''
        URL of the NasTech Agent gateway HTTP API.
        Requires API_SERVER_ENABLED=true in the gateway's environment.
      '';
    };

    nastechDashboardUrl = mkOption {
      type = types.str;
      default = "http://127.0.0.1:9119";
      description = "URL of the NasTech Agent dashboard.";
    };

    passwordFile = mkOption {
      type = types.nullOr types.path;
      default = null;
      description = ''
        Path to a file whose first line is the workspace session password.
        Required when host is not a loopback address.
        Use a secrets manager (sops-nix, agenix, etc.) to manage this file.
      '';
    };

    cookieSecure = mkOption {
      type = types.nullOr types.bool;
      default = null;
      description = ''
        Override the Secure flag on session cookies.
        null means "auto" (enabled in production mode).
        Set to false for plain-HTTP LAN deployments behind a proxy.
      '';
    };

    trustProxy = mkOption {
      type = types.bool;
      default = false;
      description = ''
        Trust X-Forwarded-For / X-Real-IP headers from a reverse proxy.
        Only enable when the server is behind a trusted proxy (Nginx, Traefik, etc.).
      '';
    };

    allowInsecureRemote = mkOption {
      type = types.bool;
      default = false;
      description = ''
        Allow binding to non-loopback addresses without a password.
        NOT recommended — only use behind a custom auth layer.
      '';
    };

    nastechWorldEnabled = mkOption {
      type = types.bool;
      default = true;
      description = "Show the NasTechWorld multiplayer link in the sidebar.";
    };

    extraEnvironment = mkOption {
      type = types.attrsOf types.str;
      default = { };
      example = {
        STREAM_ACCEPTED_TIMEOUT_MS = "120000";
        VITE_PLAYGROUND_WS_URL = "wss://my-hub.example.com/playground";
      };
      description = "Extra environment variables passed to the service.";
    };

    environmentFile = mkOption {
      type = types.nullOr types.path;
      default = null;
      description = ''
        Path to a file containing additional environment variables
        (KEY=value, one per line). Useful for secrets not covered by
        the structured options above.
      '';
    };

    user = mkOption {
      type = types.str;
      default = "nastech-workspace";
      description = "System user to run the service as.";
    };

    group = mkOption {
      type = types.str;
      default = "nastech-workspace";
      description = "System group to run the service as.";
    };

    dataDir = mkOption {
      type = types.path;
      default = "/var/lib/nastech-workspace";
      description = ''
        State directory for the workspace (sessions, runtime data).
        The service user must have write access.
      '';
    };
  };

  config = mkIf cfg.enable {
    users.users.${cfg.user} = lib.mkDefault {
      isSystemUser = true;
      group = cfg.group;
      home = cfg.dataDir;
      createHome = true;
      description = "NasTech Workspace service user";
    };

    users.groups.${cfg.group} = lib.mkDefault { };

    systemd.services.nastech-workspace = {
      description = "NasTech Workspace Web Server";
      documentation = [ "https://github.com/nastech-ai/nastech-workspace" ];
      wantedBy = [ "multi-user.target" ];
      after = [ "network.target" ];

      environment =
        {
          NODE_ENV = "production";
          PORT = toString cfg.port;
          HOST = cfg.host;
          NASTECH_API_URL = cfg.nastechApiUrl;
          NASTECH_DASHBOARD_URL = cfg.nastechDashboardUrl;
          VITE_NASTECHWORLD_ENABLED = if cfg.nastechWorldEnabled then "1" else "0";
          TRUST_PROXY = if cfg.trustProxy then "1" else "0";
          NASTECH_ALLOW_INSECURE_REMOTE = if cfg.allowInsecureRemote then "1" else "0";
          # Point HOME to the data dir so session files land there
          HOME = cfg.dataDir;
        }
        // lib.optionalAttrs (cfg.cookieSecure != null) {
          COOKIE_SECURE = if cfg.cookieSecure then "1" else "0";
        }
        // cfg.extraEnvironment;

      serviceConfig = {
        Type = "simple";
        User = cfg.user;
        Group = cfg.group;
        WorkingDirectory = cfg.dataDir;

        ExecStart = "${lib.getExe cfg.package}";

        # Load the password file as an env file when specified.
        # The file must contain: NASTECH_PASSWORD=<value>
        EnvironmentFile = lib.optional (cfg.passwordFile != null) cfg.passwordFile
          ++ lib.optional (cfg.environmentFile != null) cfg.environmentFile;

        # Restart on failure with backoff
        Restart = "on-failure";
        RestartSec = "5s";
        StartLimitIntervalSec = "120";
        StartLimitBurst = "5";

        # Runtime directories
        RuntimeDirectory = "nastech-workspace";
        StateDirectory = lib.removePrefix "/var/lib/" cfg.dataDir;
        LogsDirectory = "nastech-workspace";

        # Security hardening (balanced against PTY + terminal needs)
        NoNewPrivileges = true;
        PrivateTmp = true;
        ProtectSystem = "strict";
        ProtectHome = true;
        ReadWritePaths = [ cfg.dataDir ];
        # PTY helper needs /dev/ptmx and /dev/pts
        PrivateDevices = false;
        DeviceAllow = [
          "/dev/ptmx rw"
          "char-pts rw"
        ];
        ProtectKernelTunables = true;
        ProtectControlGroups = true;
        ProtectKernelModules = true;
        RestrictNamespaces = true;
        RestrictRealtime = true;
        RestrictSUIDSGID = true;
        LockPersonality = true;
        MemoryDenyWriteExecute = false; # Node.js JIT requires this off
        SystemCallFilter = "@system-service";
        SystemCallErrorNumber = "EPERM";
      };
    };
  };
}
