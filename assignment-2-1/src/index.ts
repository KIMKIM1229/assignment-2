import readline from "readline";
import { BillItem, BillData, calculateBill } from "./billCalculator";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const billData: BillData = { date: "", location: "", tipPercentage: 0, items: [] };

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

async function main() {
  billData.date = await askQuestion("請輸入用餐日期（YYYY-MM-DD）：");
  billData.location = await askQuestion("請輸入餐廳名稱：");
  billData.tipPercentage = parseFloat(await askQuestion("小費百分比？（0-100）："));

  let addingItems = true;
  while (addingItems) {
    console.log("\n===== 新增收費項目 =====");
    const name = await askQuestion("餐點名稱：");
    const price = parseFloat(await askQuestion("價錢（元）："));
    const sharedAnswer = await askQuestion("是否均分？（y/n）：");

    let shared = sharedAnswer.toLowerCase() === "y";
    let payer: string | undefined = undefined;

    if (!shared) {
      payer = await askQuestion("輸入人名：");
    }

    billData.items.push({ name, price, shared, payer });

    const continueAnswer = await askQuestion("是否繼續輸入？（y/n）：");
    addingItems = continueAnswer.toLowerCase() === "y";
  }

  rl.close();

  const result = calculateBill(billData);

  // 顯示結果
  console.log("\n===== 聚餐分帳結果 =====");
  console.log(`日期：${billData.date}`);
  console.log(`地點：${billData.location}`);
  console.log("\n均分項目：");

  billData.items
    .filter((item) => item.shared)
    .forEach((item) => console.log(`${item.name} ($${item.price.toFixed(1)})`));

  console.log("\n非均分項目：");
  const groupedByPerson: Record<string, BillItem[]> = {};

  billData.items
    .filter((item) => !item.shared && item.payer)
    .forEach((item) => {
      if (!groupedByPerson[item.payer!]) {
        groupedByPerson[item.payer!] = [];
      }
      groupedByPerson[item.payer!].push(item);
    });

  Object.entries(groupedByPerson).forEach(([person, items]) => {
    console.log(`\n${person}:`);
    items.forEach((item) => console.log(`  ${item.name} ($${item.price.toFixed(1)})`));
  });

  console.log("\n小結：$" + result.total.toFixed(1));
  console.log("小費：" + result.tip.toFixed(1));
  console.log("總金額：" + result.grandTotal.toFixed(1));

  console.log("\n分帳結果：");
  Object.entries(result.individualAmounts).forEach(([person, amount]) => {
    console.log(`${person} 應付：$${amount.toFixed(1)}`);
  });
}

main();