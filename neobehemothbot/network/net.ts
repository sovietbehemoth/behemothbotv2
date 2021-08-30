import { Bot } from "../websocket.ts";

async function curl(message:any): Promise<void> {
    const command:string[] = message.content.split(`${Bot.Prefix}curl`)[1].split(" ");
    command.shift();

    const cmd:string[] = [];
    cmd.push("curl");

    for (let i = 0; i < command.length; i++)
        cmd.push(command[i]);
    const presp:any = Deno.run({
        cmd: cmd,
        stdout: "piped",
        stderr: "piped"
    });

    const output:any = await presp.output();
    const decoded:string = new TextDecoder().decode(output);
    Bot.Client.message.send(decoded, message.channel_id);
}

export { curl };