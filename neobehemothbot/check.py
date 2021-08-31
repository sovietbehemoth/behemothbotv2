import sys

#Check platform
if sys.platform == "win32":
    sys.stderr.write("Error, windows is not supported by BehemothBot, this is because BehemothBot utilizes Unix utilities such as bash. It is recommended to either use a Unix style operating system or use Windows Subsystem for Linux.\n")
    exit(1)