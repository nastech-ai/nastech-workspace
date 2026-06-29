{
  description = "NasTech Workspace — desktop workspace for NasTech Agent";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    let
      # -----------------------------------------------------------------------
      # NixOS module — available on all systems
      # -----------------------------------------------------------------------
      nixosModules.default = import ./nix/module.nix;
      nixosModules.nastech-workspace = nixosModules.default;

      # Overlay that adds nastech-workspace into any nixpkgs instance
      overlays.default = final: _prev: {
        nastech-workspace = final.callPackage ./nix/package.nix { };
      };
      overlays.nastech-workspace = overlays.default;
    in
    # -----------------------------------------------------------------------
    # Per-system outputs
    # -----------------------------------------------------------------------
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [ overlays.default ];
        };
      in
      {
        # -----------------------------------------------------------------
        # Packages
        # -----------------------------------------------------------------
        packages = {
          default = pkgs.nastech-workspace;
          nastech-workspace = pkgs.nastech-workspace;
        };

        # -----------------------------------------------------------------
        # Apps  (nix run .  or  nix run .#nastech-workspace)
        # -----------------------------------------------------------------
        apps =
          let
            app = {
              type = "app";
              program = "${pkgs.nastech-workspace}/bin/nastech-workspace";
            };
          in
          {
            default = app;
            nastech-workspace = app;
          };

        # -----------------------------------------------------------------
        # Dev shell  (nix develop)
        # -----------------------------------------------------------------
        devShells.default = pkgs.mkShell {
          name = "nastech-workspace-dev";

          packages = with pkgs; [
            # Node / JS toolchain
            nodejs
            pnpm
            typescript

            # Python for pty-helper and build scripts
            python3

            # Nix tooling
            nil           # Nix LSP
            nixfmt-rfc-style
          ];

          shellHook = ''
            echo ""
            echo "  🚀 nastech-workspace dev shell"
            echo "     node  $(node --version)"
            echo "     pnpm  $(pnpm --version)"
            echo "     python $(python3 --version)"
            echo ""
            echo "  Quick start:"
            echo "     pnpm install"
            echo "     pnpm dev          # Vite dev server on :3000"
            echo "     pnpm build        # Production build → dist/"
            echo "     node server-entry.js  # Serve production build"
            echo ""
          '';
        };

        # -----------------------------------------------------------------
        # Formatter  (nix fmt)
        # -----------------------------------------------------------------
        formatter = pkgs.nixfmt-rfc-style;

        # -----------------------------------------------------------------
        # Checks  (nix flake check)
        # -----------------------------------------------------------------
        checks = {
          # Verify the package evaluates without building it
          package-eval = pkgs.runCommand "nastech-workspace-pkg-eval" { } ''
            echo "Package evaluated: ${pkgs.nastech-workspace.name}" > $out
          '';
        };
      }
    )
    // {
      # Expose module + overlay at the top level (system-agnostic)
      inherit nixosModules overlays;
    };
}
