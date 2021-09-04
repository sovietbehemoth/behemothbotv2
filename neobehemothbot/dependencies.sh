
#Check for Deno installation
if ! command -v deno &> /dev/null
    echo Installing Deno Compiler for TypeScript
    curl -fsSL https://deno.land/x/install/install.sh | sh && export DENO_INSTALL="/home/$USER/.deno" && export PATH="$DENO_INSTALL/bin:$PATH"
fi

#Check Python installation 
if ! command -v python3 &> /dev/null
    echo Installing Python
    sudo apt install python3
    sudo apt install python3-pip
    pip install websocket-client
fi