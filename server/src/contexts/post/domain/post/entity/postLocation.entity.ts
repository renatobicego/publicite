export class PostLocation {
  private location: {
    type: 'Point';
    coordinates: [number, number];
  };
  private userSetted: boolean;
  private description: string;

  constructor(
    coordinates: [number, number],
    userSetted: boolean,
    description: string,
  ) {
    this.location = {
      type: 'Point',
      coordinates: coordinates,
    };
    this.userSetted = userSetted;
    this.description = description;
  }

  getLocation() {
    return this.location;
  }

  getUserSetted() {
    return this.userSetted;
  }

  getDescription() {
    return this.description;
  }
}
