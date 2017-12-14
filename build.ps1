function ZipFiles($sourcedir, $zipfilename)
{
	Add-Type -Assembly System.IO.Compression.FileSystem
	$compressionLevel = [System.IO.Compression.CompressionLevel]::Optimal
	If (Test-Path $zipfilename) {
		Remove-Item $zipfilename -ErrorAction ignore -recurse -confirm:$false -force
	}
	[System.IO.Compression.ZipFile]::CreateFromDirectory($sourcedir, $zipfilename, $compressionLevel, $false)
}
ZipFiles "jira" "jira.zip"
