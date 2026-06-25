export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  displayCurrencyId: string | null;
  displayCurrencyName: string | null;
  createdAt: Date;
  updatedAt: Date;
}
