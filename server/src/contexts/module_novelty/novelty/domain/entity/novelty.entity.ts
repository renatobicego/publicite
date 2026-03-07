export interface NoveltyBlockEntity {
  type: string;
  data: string;
}

export interface NoveltyPropertyEntity {
  key: string;
  value: string;
}

export class NoveltyEntity {
  readonly _id?: string;
  readonly properties: NoveltyPropertyEntity[];
  readonly blocks: NoveltyBlockEntity[];

  constructor(params: {
    _id?: string;
    properties: NoveltyPropertyEntity[];
    blocks: NoveltyBlockEntity[];
  }) {
    this._id = params._id;
    this.properties = params.properties;
    this.blocks = params.blocks;
  }
}
