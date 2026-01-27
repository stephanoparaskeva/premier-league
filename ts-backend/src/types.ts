export type Club = {
  readonly name: string;
  readonly code: string;
  readonly country: string;
};

export type Score = {
  readonly ft: readonly [number, number];
};

export type Match = {
  readonly round: string;
  readonly competition?: string; // defaults to "Premier League" if absent
  readonly date: string; // YYYY-MM-DD
  readonly home: string; // club name in JSON, later normalized to code for WS output
  readonly away: string;
  readonly score?: Score;
};

export type WsPayload = Match | readonly Match[] | { readonly type: "season_finished" };
