type paymentType = "Weekly" | "Bi-Weekly" | "Monthly" | "Upfront";

export type Platform = {
  id: string;
  name: string;
  paymentType: paymentType;
  hourlyRate: number;
  nextPayData: string;
};

export type PlatformsState = {
  platforms: Platform[];
};
