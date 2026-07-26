export interface Customer {
  id?: number;
  name: string;
  location: string;
  contact: string;
  phone: string;
  salesPersonId?: number;
  salesPersonName?: string;
  salesPersonIds?: number[];
  salesPersonNames?: string[];
}
