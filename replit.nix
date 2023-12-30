{ pkgs }: {
	deps = [
		pkgs.neofetch
                pkgs.ffmpeg
		pkgs.imagemagick
		pkgs.nodejs-18_x
		pkgs.speedtest-cli
		pkgs.jellyfin-ffmpeg
		pkgs.git
		pkgs.python2
		pkgs.python310Packages.python
	];
}
