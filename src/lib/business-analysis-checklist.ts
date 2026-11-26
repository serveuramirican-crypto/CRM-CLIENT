import { ChecklistStageConfig, ChecklistProblemConfig } from './types';

export const BUSINESS_ANALYSIS_STAGES: ChecklistStageConfig[] = [
  {
    id: 'stage_1_traffic',
    stageNumber: 1,
    code: 'STAGE 1',
    title: 'TRAFFIC',
    description: 'كيفاش الناس كيعرفو المتجر وكيكتاشفو المنتجات ديالو؟',
    problems: [
      {
        id: 'stage_1_traffic_1',
        number: 1,
        text: 'المتجر ما كينشرش بانتظام (Inconsistent Content).',
      },
      {
        id: 'stage_1_traffic_2',
        number: 2,
        text: 'المحتوى ما كيجذبش انتباه الجمهور.',
      },
      {
        id: 'stage_1_traffic_3',
        number: 3,
        text: 'صور وفيديوهات المنتجات ضعيفة الجودة.',
      },
      {
        id: 'stage_1_traffic_4',
        number: 4,
        text: 'المتجر كيعتمد على نوع واحد فقط من Traffic.',
      },
      {
        id: 'stage_1_traffic_5',
        number: 5,
        text: 'المتجر كيعتمد على الإعلانات فقط.',
      },
      {
        id: 'stage_1_traffic_6',
        number: 6,
        text: 'الإعلانات كتجيب تفاعلات ولكن ما كتجيبش استفسارات مؤهلة.',
      },
      {
        id: 'stage_1_traffic_7',
        number: 7,
        text: 'المحتوى كيوصل لجمهور غير مناسب (Wrong Audience).',
      },
      {
        id: 'stage_1_traffic_8',
        number: 8,
        text: 'ما كاينش تعاون مع Influencers أو صفحات أخرى رغم ملاءمتها.',
      },
      {
        id: 'stage_1_traffic_9',
        number: 9,
        text: 'المتجر ما كيبانش في نتائج البحث المحلية (Local Search).',
      },
      {
        id: 'stage_1_traffic_10',
        number: 10,
        text: 'المتجر ما كيعرفش شنو المحتوى أو الإعلانات اللي كتجيب زبناء فعليين.',
      },
      {
        id: 'stage_1_traffic_11',
        number: 11,
        text: 'ما كايناش استراتيجية لجلب زبناء جدد.',
      },
      {
        id: 'stage_1_traffic_12',
        number: 12,
        text: 'المتجر كيعتمد بزاف على مصدر واحد للزبناء.',
      },
    ],
  },
  {
    id: 'stage_2_lead_capture',
    stageNumber: 2,
    code: 'STAGE 2',
    title: 'LEAD CAPTURE',
    description: 'كيفاش الشخص اللي عجبو المنتج كيتحول إلى شخص كيتواصل مع المتجر؟',
    problems: [
      {
        id: 'stage_2_lead_capture_1',
        number: 1,
        text: 'Bio ديال Instagram ما واضحش.',
      },
      {
        id: 'stage_2_lead_capture_2',
        number: 2,
        text: 'ما كاينش CTA واضح (شنو خاص الزبون يدير؟).',
      },
      {
        id: 'stage_2_lead_capture_3',
        number: 3,
        text: 'رابط WhatsApp صعيب تلقاه.',
      },
      {
        id: 'stage_2_lead_capture_4',
        number: 4,
        text: 'رقم الهاتف ومعلومات التواصل ناقصة.',
      },
      {
        id: 'stage_2_lead_capture_5',
        number: 5,
        text: 'الزبون ما عارفش فين يطلب المنتج.',
      },
      {
        id: 'stage_2_lead_capture_6',
        number: 6,
        text: 'ما كايناش طريقة واضحة للانتقال من Instagram إلى WhatsApp.',
      },
      {
        id: 'stage_2_lead_capture_7',
        number: 7,
        text: 'المنشورات ما فيهاش طريقة واضحة للطلب.',
      },
      {
        id: 'stage_2_lead_capture_8',
        number: 8,
        text: 'ما كايناش Product Landing Page.',
      },
      {
        id: 'stage_2_lead_capture_9',
        number: 9,
        text: 'الزبون خاصو يقلب بزاف باش يوصل للمنتج اللي بغا.',
      },
      {
        id: 'stage_2_lead_capture_10',
        number: 10,
        text: 'المتجر ما كيجمعش معلومات الأشخاص المهتمين بموافقتهم.',
      },
      {
        id: 'stage_2_lead_capture_11',
        number: 11,
        text: 'ما كايناش طريقة سهلة لتسجيل طلب أو استفسار.',
      },
    ],
  },
  {
    id: 'stage_3_lead_management',
    stageNumber: 3,
    code: 'STAGE 3',
    title: 'LEAD MANAGEMENT',
    description: 'من بعد ما الزبون يتواصل مع المتجر، كيفاش كيتعامل معاه؟',
    problems: [
      {
        id: 'stage_3_lead_management_1',
        number: 1,
        text: 'صاحب المتجر ما كيجاوبش على بعض تعليقات Instagram.',
      },
      {
        id: 'stage_3_lead_management_2',
        number: 2,
        text: 'كاينين DMs بلا جواب.',
      },
      {
        id: 'stage_3_lead_management_3',
        number: 3,
        text: 'الرد على الرسائل كيتأخر.',
      },
      {
        id: 'stage_3_lead_management_4',
        number: 4,
        text: 'صاحب المتجر كينسى بعض المحادثات.',
      },
      {
        id: 'stage_3_lead_management_5',
        number: 5,
        text: 'كاينين مهتمين ما كيتابع معاهم حتى واحد.',
      },
      {
        id: 'stage_3_lead_management_6',
        number: 6,
        text: 'ما كايناش طريقة لتنظيم المحادثات.',
      },
      {
        id: 'stage_3_lead_management_7',
        number: 7,
        text: 'ما معروفش شكون من الموظفين مسؤول على كل عميل.',
      },
      {
        id: 'stage_3_lead_management_8',
        number: 8,
        text: 'نفس الزبون كيعاود يسول على نفس المعلومات.',
      },
      {
        id: 'stage_3_lead_management_9',
        number: 9,
        text: 'المتجر ما كيعرفش يفرق بين عميل جديد وعميل مهتم وعميل طلب.',
      },
      {
        id: 'stage_3_lead_management_10',
        number: 10,
        text: 'ما كايناش طريقة لمتابعة الأشخاص اللي توقفو في وسط المحادثة.',
      },
      {
        id: 'stage_3_lead_management_11',
        number: 11,
        text: 'المحادثات موزعة بين حسابات Instagram وWhatsApp مختلفة.',
      },
      {
        id: 'stage_3_lead_management_12',
        number: 12,
        text: 'ما كايناش طريقة لمعرفة حالة كل Lead.',
      },
    ],
  },
  {
    id: 'stage_4_sales',
    stageNumber: 4,
    code: 'STAGE 4',
    title: 'SALES',
    description: 'علاش الشخص المهتم بالمنتج ما كيكملش الشراء؟',
    subcategories: [
      {
        id: 'stage_4_sales_a',
        title: 'A. Product Presentation',
        problems: [
          {
            id: 'stage_4_sales_a_1',
            number: 1,
            text: 'صور المنتجات غير واضحة.',
          },
          {
            id: 'stage_4_sales_a_2',
            number: 2,
            text: 'ما كايناش صور من زوايا مختلفة.',
          },
          {
            id: 'stage_4_sales_a_3',
            number: 3,
            text: 'ما كايناش Videos كتوضح المنتج أثناء الاستعمال.',
          },
          {
            id: 'stage_4_sales_a_4',
            number: 4,
            text: 'وصف المنتج ناقص.',
          },
          {
            id: 'stage_4_sales_a_5',
            number: 5,
            text: 'الخامة (Material) ما موضحاش.',
          },
          {
            id: 'stage_4_sales_a_6',
            number: 6,
            text: 'المقاسات (Sizes) ما موضحاش.',
          },
          {
            id: 'stage_4_sales_a_7',
            number: 7,
            text: 'دليل المقاسات (Size Guide) غير موجود.',
          },
          {
            id: 'stage_4_sales_a_8',
            number: 8,
            text: 'الألوان المتوفرة ما واضحةش.',
          },
          {
            id: 'stage_4_sales_a_9',
            number: 9,
            text: 'ما كايناش صور لكل لون.',
          },
          {
            id: 'stage_4_sales_a_10',
            number: 10,
            text: 'فوائد ومميزات المنتج ما واضحةش.',
          },
          {
            id: 'stage_4_sales_a_11',
            number: 11,
            text: 'الفرق بين المنتجات المتشابهة ما واضحش.',
          },
        ],
      },
      {
        id: 'stage_4_sales_b',
        title: 'B. Product Selection',
        problems: [
          {
            id: 'stage_4_sales_b_1',
            number: 1,
            text: 'المتجر عندو موديلات كثيرة ولكن ما منظمهاش.',
          },
          {
            id: 'stage_4_sales_b_2',
            number: 2,
            text: 'صعيب على الزبون يقارن بين المنتجات.',
          },
          {
            id: 'stage_4_sales_b_3',
            number: 3,
            text: 'ما كايناش Recommended Products.',
          },
          {
            id: 'stage_4_sales_b_4',
            number: 4,
            text: 'ما كايناش خيارات واضحة للمقاسات والألوان.',
          },
          {
            id: 'stage_4_sales_b_5',
            number: 5,
            text: 'حالة المخزون (Stock Availability) ما واضحةش.',
          },
          {
            id: 'stage_4_sales_b_6',
            number: 6,
            text: 'الزبون خاصو يسول الموظف باش يعرف واش المقاس متوفر.',
          },
          {
            id: 'stage_4_sales_b_7',
            number: 7,
            text: 'ما كايناش اقتراحات لمنتجات مكملة للمنتج الأصلي.',
          },
        ],
      },
      {
        id: 'stage_4_sales_c',
        title: 'C. Offer & Pricing',
        problems: [
          {
            id: 'stage_4_sales_c_1',
            number: 1,
            text: 'الثمن ما واضحش.',
          },
          {
            id: 'stage_4_sales_c_2',
            number: 2,
            text: 'مصاريف التوصيل ما واضحةش قبل الطلب.',
          },
          {
            id: 'stage_4_sales_c_3',
            number: 3,
            text: 'العرض التجاري ما مفهومش.',
          },
          {
            id: 'stage_4_sales_c_4',
            number: 4,
            text: 'ما كاينش توضيح للفرق بين العروض أو المنتجات.',
          },
          {
            id: 'stage_4_sales_c_5',
            number: 5,
            text: 'الزبون كيعترض باستمرار على الثمن.',
          },
          {
            id: 'stage_4_sales_c_6',
            number: 6,
            text: 'قيمة المنتج ما واضحةش مقارنة بالثمن.',
          },
          {
            id: 'stage_4_sales_c_7',
            number: 7,
            text: 'العروض والتخفيضات ما منظمةش.',
          },
          {
            id: 'stage_4_sales_c_8',
            number: 8,
            text: 'ما كاينش وضوح في شروط التخفيض أو العرض.',
          },
        ],
      },
      {
        id: 'stage_4_sales_d',
        title: 'D. Trust & Objections',
        problems: [
          {
            id: 'stage_4_sales_d_1',
            number: 1,
            text: 'معلومات التوصيل ناقصة.',
          },
          {
            id: 'stage_4_sales_d_2',
            number: 2,
            text: 'سياسة التبديل والإرجاع غير واضحة.',
          },
          {
            id: 'stage_4_sales_d_3',
            number: 3,
            text: 'آراء الزبناء غير ظاهرة.',
          },
          {
            id: 'stage_4_sales_d_4',
            number: 4,
            text: 'ما كايناش صور حقيقية من العملاء.',
          },
          {
            id: 'stage_4_sales_d_5',
            number: 5,
            text: 'معلومات المتجر ووسائل التواصل غير واضحة.',
          },
          {
            id: 'stage_4_sales_d_6',
            number: 6,
            text: 'الزبناء كيسولو باستمرار واش المتجر موثوق.',
          },
          {
            id: 'stage_4_sales_d_7',
            number: 7,
            text: 'الموظف ما كيعرفش يتعامل مع اعتراضات الزبون.',
          },
          {
            id: 'stage_4_sales_d_8',
            number: 8,
            text: 'الموظف ما كيعرفش يشرح قيمة المنتج.',
          },
          {
            id: 'stage_4_sales_d_9',
            number: 9,
            text: 'الزبون كيتردد بسبب عدم وضوح الجودة أو المقاسات.',
          },
        ],
      },
      {
        id: 'stage_4_sales_e',
        title: 'E. Ordering & Checkout',
        problems: [
          {
            id: 'stage_4_sales_e_1',
            number: 1,
            text: 'الزبون خاصو يدوز من خطوات كثيرة باش يطلب.',
          },
          {
            id: 'stage_4_sales_e_2',
            number: 2,
            text: 'طريقة تسجيل الطلب معقدة.',
          },
          {
            id: 'stage_4_sales_e_3',
            number: 3,
            text: 'الزبون خاصو يعاود يصيفط نفس المعلومات عدة مرات.',
          },
          {
            id: 'stage_4_sales_e_4',
            number: 4,
            text: 'ما كايناش Order Form منظمة.',
          },
          {
            id: 'stage_4_sales_e_5',
            number: 5,
            text: 'خيارات الدفع ما واضحةش.',
          },
          {
            id: 'stage_4_sales_e_6',
            number: 6,
            text: 'الزبون ما عارفش شنو خاصو يدير من بعد اختيار المنتج.',
          },
          {
            id: 'stage_4_sales_e_7',
            number: 7,
            text: 'كاينين أشخاص كيبداو الطلب وما كيكملوهوش.',
          },
          {
            id: 'stage_4_sales_e_8',
            number: 8,
            text: 'ما كايناش طريقة منظمة لمتابعة الطلبات غير المكتملة.',
          },
        ],
      },
    ],
  },
  {
    id: 'stage_5_customer_experience',
    stageNumber: 5,
    code: 'STAGE 5',
    title: 'CUSTOMER EXPERIENCE',
    description: 'شنو كيوقع من بعد ما الزبون يسجل الطلب؟',
    problems: [
      {
        id: 'stage_5_customer_experience_1',
        number: 1,
        text: 'الزبون ما كيتوصلش بتأكيد الطلب.',
      },
      {
        id: 'stage_5_customer_experience_2',
        number: 2,
        text: 'معلومات الطلب كتكون خاطئة.',
      },
      {
        id: 'stage_5_customer_experience_3',
        number: 3,
        text: 'المتجر ما كيتأكدش من المقاس واللون والعنوان.',
      },
      {
        id: 'stage_5_customer_experience_4',
        number: 4,
        text: 'كاين تأخر في تجهيز الطلبات.',
      },
      {
        id: 'stage_5_customer_experience_5',
        number: 5,
        text: 'الزبون ما كيعرفش فين وصل الطلب ديالو.',
      },
      {
        id: 'stage_5_customer_experience_6',
        number: 6,
        text: 'ما كايناش Tracking Information.',
      },
      {
        id: 'stage_5_customer_experience_7',
        number: 7,
        text: 'الطلبات كتتوصل متأخرة.',
      },
      {
        id: 'stage_5_customer_experience_8',
        number: 8,
        text: 'الزبون كيتوصل بمنتج مختلف عن اللي طلب.',
      },
      {
        id: 'stage_5_customer_experience_9',
        number: 9,
        text: 'مشاكل في جودة التغليف.',
      },
      {
        id: 'stage_5_customer_experience_10',
        number: 10,
        text: 'المتجر ما كيعالجش الشكايات بسرعة.',
      },
      {
        id: 'stage_5_customer_experience_11',
        number: 11,
        text: 'كاين مشكل في تبديل أو إرجاع المنتجات.',
      },
      {
        id: 'stage_5_customer_experience_12',
        number: 12,
        text: 'نسبة رفض طلبات COD مرتفعة.',
      },
    ],
  },
  {
    id: 'stage_6_retention',
    stageNumber: 6,
    code: 'STAGE 6',
    title: 'RETENTION',
    description: 'كيفاش المتجر كيخلي الزبون اللي اشترى يرجع يشري مرة أخرى؟',
    problems: [
      {
        id: 'stage_6_retention_1',
        number: 1,
        text: 'المتجر ما كيتواصلش مع الزبون بعد الشراء.',
      },
      {
        id: 'stage_6_retention_2',
        number: 2,
        text: 'ما كيطالبش الزبون بتقييم المنتج.',
      },
      {
        id: 'stage_6_retention_3',
        number: 3,
        text: 'ما كايناش Loyalty Program.',
      },
      {
        id: 'stage_6_retention_4',
        number: 4,
        text: 'ما كايناش عروض خاصة بالزبناء السابقين.',
      },
      {
        id: 'stage_6_retention_5',
        number: 5,
        text: 'ما كايناش طريقة لإخبار العملاء بالمنتجات الجديدة.',
      },
      {
        id: 'stage_6_retention_6',
        number: 6,
        text: 'ما كايناش استراتيجية لإعادة تنشيط العملاء القدامى.',
      },
      {
        id: 'stage_6_retention_7',
        number: 7,
        text: 'ما كايناش Referral Program لتشجيع التوصيات.',
      },
      {
        id: 'stage_6_retention_8',
        number: 8,
        text: 'ما كايناش Product Recommendations حسب مشتريات الزبون.',
      },
      {
        id: 'stage_6_retention_9',
        number: 9,
        text: 'المتجر ما كيميزش بين الزبون الجديد والزبون الدائم.',
      },
      {
        id: 'stage_6_retention_10',
        number: 10,
        text: 'ما كايناش متابعة للزبناء اللي ما شراوش منذ مدة.',
      },
    ],
  },
  {
    id: 'stage_7_operations_intelligence',
    stageNumber: 7,
    code: 'STAGE 7',
    title: 'OPERATIONS & INTELLIGENCE',
    description: 'كيفاش المتجر كينظم الخدمة ديالو وكيعرف النتائج ديالو؟',
    subcategories: [
      {
        id: 'stage_7_operations',
        title: 'A. Operations',
        problems: [
          {
            id: 'stage_7_operations_1',
            number: 1,
            text: 'معلومات المنتجات موزعة في أماكن مختلفة.',
          },
          {
            id: 'stage_7_operations_2',
            number: 2,
            text: 'المخزون كيتسجل يدوياً بطريقة غير منظمة.',
          },
          {
            id: 'stage_7_operations_3',
            number: 3,
            text: 'ما كايناش متابعة للمقاسات والألوان المتوفرة.',
          },
          {
            id: 'stage_7_operations_4',
            number: 4,
            text: 'كاينين أخطاء في تسجيل الطلبات.',
          },
          {
            id: 'stage_7_operations_5',
            number: 5,
            text: 'نفس الطلب كيتسجل أكثر من مرة.',
          },
          {
            id: 'stage_7_operations_6',
            number: 6,
            text: 'الموظفين ما عارفينش شكون مسؤول على الطلب.',
          },
          {
            id: 'stage_7_operations_7',
            number: 7,
            text: 'معالجة الطلبات كتحتاج وقت طويل.',
          },
          {
            id: 'stage_7_operations_8',
            number: 8,
            text: 'المتجر ما عندوش نظام مركزي لإدارة المنتجات والطلبات.',
          },
          {
            id: 'stage_7_operations_9',
            number: 9,
            text: 'المخزون في Instagram/WhatsApp ما متزامنش مع المخزون الحقيقي.',
          },
          {
            id: 'stage_7_operations_10',
            number: 10,
            text: 'التحديثات على الأسعار والمنتجات كتحتاج مجهود كبير.',
          },
        ],
      },
      {
        id: 'stage_7_intelligence',
        title: 'B. Intelligence',
        problems: [
          {
            id: 'stage_7_intelligence_1',
            number: 1,
            text: 'المتجر ما كيعرفش عدد الاستفسارات المؤهلة.',
          },
          {
            id: 'stage_7_intelligence_2',
            number: 2,
            text: 'ما كيعرفش شحال من استفسار تحول إلى طلب.',
          },
          {
            id: 'stage_7_intelligence_3',
            number: 3,
            text: 'ما كيعرفش شحال من طلب تأكد.',
          },
          {
            id: 'stage_7_intelligence_4',
            number: 4,
            text: 'ما كيعرفش شحال من طلب توصل بنجاح.',
          },
          {
            id: 'stage_7_intelligence_5',
            number: 5,
            text: 'ما كيعرفش المنتجات الأكثر مبيعاً.',
          },
          {
            id: 'stage_7_intelligence_6',
            number: 6,
            text: 'ما كيعرفش المنتجات اللي عندها طلب قليل.',
          },
          {
            id: 'stage_7_intelligence_7',
            number: 7,
            text: 'ما كيعرفش الأرباح الحقيقية لكل منتج.',
          },
          {
            id: 'stage_7_intelligence_8',
            number: 8,
            text: 'ما كيعرفش مصدر العملاء الأكثر فاعلية.',
          },
          {
            id: 'stage_7_intelligence_9',
            number: 9,
            text: 'ما كيعرفش واش الإعلانات كتجيب مبيعات مربحة.',
          },
          {
            id: 'stage_7_intelligence_10',
            number: 10,
            text: 'ما عندوش Reports لمتابعة الأداء.',
          },
        ],
      },
    ],
  },
];

export function getStageProblems(stage: ChecklistStageConfig): ChecklistProblemConfig[] {
  if (stage.problems) return stage.problems;
  if (stage.subcategories) {
    return stage.subcategories.flatMap((sub) => sub.problems);
  }
  return [];
}

export const TOTAL_CHECKLIST_ITEMS: number = BUSINESS_ANALYSIS_STAGES.reduce(
  (sum, stage) => sum + getStageProblems(stage).length,
  0
);

export const VERIFICATION_STATUS_OPTIONS = [
  'Observed',
  'Possible Problem',
  'Validated Problem',
  'Not Verified',
] as const;

export const BUSINESS_TYPE_OPTIONS = [
  'Local Business',
  'Online Business',
  'Ecommerce',
  'Other',
] as const;

export const BUSINESS_CATEGORY_OPTIONS = [
  'Clothing',
  'Cosmetics',
  'Restaurant',
  'Fitness',
  'Services',
  'Other',
] as const;

export const BUSINESS_STATUS_OPTIONS = ['Active', 'Inactive'] as const;

export const CONTACT_CHANNEL_OPTIONS = [
  'Instagram',
  'WhatsApp',
  'Website',
  'Phone',
  'Physical Store',
  'Other',
] as const;
