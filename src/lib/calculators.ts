export type DelayDamageInput = {
  principal: number;
  startIndex: number;
  endIndex: number;
  fromDate: string;
  toDate: string;
  days: number;
  startLabel: string;
  endLabel: string;
};

export type DelayDamageResult = {
  principal: number;
  updatedAmount: number;
  damageAmount: number;
  startIndex: number;
  endIndex: number;
  startLabel: string;
  endLabel: string;
  fromDate: string;
  toDate: string;
  days: number;
  formula: string;
  legalBasis: string;
  disclaimer: string;
};

export function calculateDelayDamage(input: DelayDamageInput): DelayDamageResult {
  if (input.startIndex <= 0 || input.endIndex <= 0) {
    throw new Error("شاخص تورم نامعتبر است");
  }
  const updatedAmount = (input.principal * input.endIndex) / input.startIndex;
  const damageAmount = Math.max(0, updatedAmount - input.principal);

  return {
    principal: Math.round(input.principal),
    updatedAmount: Math.round(updatedAmount),
    damageAmount: Math.round(damageAmount),
    startIndex: input.startIndex,
    endIndex: input.endIndex,
    startLabel: input.startLabel,
    endLabel: input.endLabel,
    fromDate: input.fromDate,
    toDate: input.toDate,
    days: input.days,
    formula: "مبلغ به‌روز = اصل دین × (شاخص زمان پرداخت ÷ شاخص زمان سررسید)",
    legalBasis: "ماده ۵۲۲ قانون آیین دادرسی مدنی",
    disclaimer:
      "این محاسبه صرفاً جنبه‌ی تخمینی دارد و بر اساس شاخص‌های واردشده انجام شده است. تشخیص نهایی میزان خسارت با مرجع قضایی صالح است.",
  };
}

export type DowryInput = {
  originalAmount: number;
  startIndex: number;
  endIndex: number;
  startLabel: string;
  endLabel: string;
};

export type DowryResult = {
  originalAmount: number;
  currentValue: number;
  difference: number;
  startIndex: number;
  endIndex: number;
  startLabel: string;
  endLabel: string;
  formula: string;
  legalBasis: string;
  disclaimer: string;
};

export function calculateDowry(input: DowryInput): DowryResult {
  if (input.startIndex <= 0 || input.endIndex <= 0) {
    throw new Error("شاخص تورم نامعتبر است");
  }
  const currentValue = (input.originalAmount * input.endIndex) / input.startIndex;
  const difference = Math.max(0, currentValue - input.originalAmount);

  return {
    originalAmount: Math.round(input.originalAmount),
    currentValue: Math.round(currentValue),
    difference: Math.round(difference),
    startIndex: input.startIndex,
    endIndex: input.endIndex,
    startLabel: input.startLabel,
    endLabel: input.endLabel,
    formula: "مهریه به نرخ روز = مبلغ مهریه × (شاخص زمان مطالبه ÷ شاخص زمان عقد)",
    legalBasis: "تبصره‌ی ماده ۱۰۸۲ قانون مدنی",
    disclaimer:
      "این محاسبه صرفاً جنبه‌ی تخمینی دارد و فقط مهریه‌ی وجه نقد (ریال/تومان) را پوشش می‌دهد. محاسبه‌ی مهریه‌ی سکه نیازمند نرخ روز سکه است. تشخیص نهایی با مرجع قضایی صالح است.",
  };
}

export type DiyeInput = {
  fullDiyeAmount: bigint;
  percentage: number;
  jalaliYear: number;
};

export type DiyeResult = {
  fullDiyeAmount: string;
  percentage: number;
  calculatedAmount: string;
  jalaliYear: number;
  formula: string;
  legalBasis: string;
  disclaimer: string;
};

export function calculateDiye(input: DiyeInput): DiyeResult {
  if (input.percentage <= 0 || input.percentage > 100) {
    throw new Error("درصد دیه باید بین ۱ تا ۱۰۰ باشد");
  }
  const calculated = (input.fullDiyeAmount * BigInt(Math.round(input.percentage * 100))) / 10000n;

  return {
    fullDiyeAmount: input.fullDiyeAmount.toString(),
    percentage: input.percentage,
    calculatedAmount: calculated.toString(),
    jalaliYear: input.jalaliYear,
    formula: "مبلغ دیه = دیه کامل × درصد دیه",
    legalBasis: "ماده ۵۴۹ قانون مجازات اسلامی و بخشنامه سالانه قوه قضاییه",
    disclaimer:
      "مبلغ دیه بر اساس نرخ اعلامی قوه قضاییه برای سال مورد نظر محاسبه شده است. نرخ دیه بسته به ماه‌های حرام تغییر می‌کند (تغلیظ دیه). تشخیص نهایی با مرجع قضایی صالح است.",
  };
}
