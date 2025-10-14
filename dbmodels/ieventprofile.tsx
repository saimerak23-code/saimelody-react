import { IEvent } from "./ievent";
import { iProfile } from "./iprofile";

export type iEventProfile = {
  events: IEvent[];
  profile: iProfile;
}