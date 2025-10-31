import useMySQLAuthState from "mysql-baileys";
import { AuthenticationState } from "baileys";

export interface AuthConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  session?: string;
}

export type SaveCreds = () => Promise<void>;

export class Auth {
  private config: AuthConfig;
  public saveCreds: SaveCreds | null = null;
  public state: AuthenticationState | null = null;

  constructor(config: AuthConfig) {
    this.config = { session: "default_session", ...config };
  }

  public async init() {
    const { saveCreds, state } = await useMySQLAuthState({
      host: this.config.host,
      user: this.config.user,
      password: this.config.password,
      database: this.config.database,
      session: this.config.session!,
    });

    this.saveCreds = saveCreds;
    this.state = state;
  }
}
