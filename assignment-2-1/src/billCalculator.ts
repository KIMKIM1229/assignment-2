export interface BillItem {
    name: string;
    price: number;
    shared: boolean;
    payer?: string;
  }
  
  export interface BillData {
    date: string;
    location: string;
    tipPercentage: number;
    items: BillItem[];
  }
  
  export function calculateBill(bill: BillData) {
    const total = bill.items.reduce((sum, item) => sum + item.price, 0);
    const tip = (total * bill.tipPercentage) / 100;
    const grandTotal = total + tip;
  
    // 計算每個人的應付金額
    const individualAmounts: Record<string, number> = {};
    let sharedTotal = 0;
    let sharedCount = 0;
  
    for (const item of bill.items) {
      if (item.shared) {
        sharedTotal += item.price;
        sharedCount++;
      } else if (item.payer) {
        individualAmounts[item.payer] = (individualAmounts[item.payer] || 0) + item.price;
      }
    }
  
    const perPersonShare = sharedCount > 0 ? sharedTotal / sharedCount : 0;
  
    for (const key in individualAmounts) {
      individualAmounts[key] += perPersonShare;
    }
  
    return { total, tip, grandTotal, individualAmounts };
  }