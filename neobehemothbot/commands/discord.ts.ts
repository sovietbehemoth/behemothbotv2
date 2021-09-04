type intent = "message" | "typing" | "guild_join" | "ready";

interface bot_init_options {
  os: string,
  device: string,
  browser: string
}

interface base_payload {
    event: string,
    data: any
}

interface Users {
  Name: string,
  Level: number,
  NumberOfMessages: number,
  Id: string
}

interface message {
    send: (content:string, channel?:string, tts?:boolean) => Promise<void>;
    delete: (message:string, channel?:string) => Promise<void>;
    edit: (content:string, message:string, channel?:string) => Promise<void>;
    reply: (content:string, message:string, server?:string, channel?:string) => Promise<void>;
}

interface typing {
    start: () => Promise<void>;
    stop: () => Promise<void>;
}

export class DiscordClient {
    constructor(Token:string, options?:any);

    declare private Socket:WebSocket;
    declare private SessionID:string;
    declare private HeartbeatInterval;
    declare private botconfig:any;
    declare private Sequences:number|null;
    declare private Callback: (data:base_payload, ...ext:any) => any;
    declare private readonly Token:string;
    declare private readonly Identify_Structure:any;

    declare protected Intents:intent | Array<intent>;
    declare public DisplayErrors:boolean;
    declare public Channel:string;

    declare public LevelTracking: {
        MSGsToLevelUp:number,
        DataFile:string,
        AutoSaveTimeSeconds:number,
        SendLevelUpMessages:boolean,
        Levels: Users[]
    }

    declare public readonly message:message;
    declare public readonly typing:typing;

    private levelUp(message:any): Promise<void>;
    private InternalCallback(event:any, events:Array<intent> | intent, callback:(data:base_payload, ...ext:any)=>any);
    private ErrorHandler(code:number): void;

    public resetLevels(): Promise<void>;
    public enableLevelTracking(): void;
    public on(event_type:Array<intent> | intent, callback:(data:base_payload, ...ext:any) => any): Promise<void>;

    public stop(): void;
    public restart(): Promise<void>;
}
