export interface SampleDatasetPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  badge: string;
  iconName: string;
  csvContent: string;
}

export const SAMPLE_DATASETS: SampleDatasetPreset[] = [
  {
    id: 'ecommerce',
    name: 'E-Commerce Global Sales & Profit',
    category: 'Retail & Sales',
    badge: 'Popular',
    iconName: 'ShoppingBag',
    description: '100 order transactions across regions, product categories, discounts, shipping costs, and profits.',
    csvContent: `Order_ID,Date,Region,Category,Sub_Category,Sales,Quantity,Discount,Profit,Shipping_Cost,Customer_Segment
ORD-1001,2025-01-05,North America,Technology,Smartphones,1299.99,2,0.1,250.00,25.50,Corporate
ORD-1002,2025-01-07,Europe,Furniture,Chairs,450.00,4,0.0,90.00,18.00,Consumer
ORD-1003,2025-01-10,Asia Pacific,Office Supplies,Paper,45.50,10,0.05,12.20,4.20,Home Office
ORD-1004,2025-01-12,North America,Technology,Laptops,2499.00,1,0.15,380.00,45.00,Corporate
ORD-1005,2025-01-15,Europe,Technology,Accessories,120.00,3,0.0,42.00,8.50,Consumer
ORD-1006,2025-01-18,Latin America,Furniture,Tables,850.00,2,0.25,-65.00,60.00,Corporate
ORD-1007,2025-01-20,Asia Pacific,Office Supplies,Binders,88.00,5,0.1,22.00,6.00,Consumer
ORD-1008,2025-01-22,North America,Furniture,Bookcases,1100.00,3,0.2,-40.00,75.00,Home Office
ORD-1009,2025-01-25,Europe,Technology,Smartphones,999.00,1,0.0,210.00,20.00,Corporate
ORD-1010,2025-01-28,North America,Office Supplies,Appliances,540.00,2,0.1,115.00,32.00,Consumer
ORD-1011,2025-02-01,Asia Pacific,Technology,Laptops,3100.00,2,0.1,520.00,50.00,Corporate
ORD-1012,2025-02-03,Europe,Furniture,Chairs,380.00,3,0.0,76.00,15.00,Home Office
ORD-1013,2025-02-05,North America,Office Supplies,Paper,62.00,12,0.0,18.60,5.00,Consumer
ORD-1014,2025-02-08,Latin America,Technology,Accessories,210.00,4,0.2,35.00,12.00,Corporate
ORD-1015,2025-02-12,Europe,Furniture,Tables,1250.00,1,0.3,-120.00,80.00,Consumer
ORD-1016,2025-02-15,North America,Technology,Smartphones,1450.00,2,0.05,310.00,28.00,Corporate
ORD-1017,2025-02-18,Asia Pacific,Office Supplies,Binders,140.00,7,0.15,31.00,9.00,Home Office
ORD-1018,2025-02-22,North America,Furniture,Chairs,620.00,2,0.1,110.00,22.00,Consumer
ORD-1019,2025-02-25,Europe,Technology,Laptops,1850.00,1,0.0,390.00,30.00,Corporate
ORD-1020,2025-02-28,Latin America,Office Supplies,Appliances,420.00,2,0.05,88.00,24.00,Consumer
ORD-1021,2025-03-02,North America,Technology,Smartphones,2200.00,3,0.1,410.00,38.00,Corporate
ORD-1022,2025-03-05,Asia Pacific,Furniture,Bookcases,950.00,2,0.2,-25.00,55.00,Home Office
ORD-1023,2025-03-08,Europe,Office Supplies,Paper,95.00,15,0.0,28.50,7.00,Consumer
ORD-1024,2025-03-12,North America,Technology,Accessories,340.00,5,0.1,85.00,14.00,Corporate
ORD-1025,2025-03-15,Latin America,Furniture,Chairs,510.00,3,0.15,70.00,25.00,Consumer
ORD-1026,2025-03-19,Asia Pacific,Technology,Laptops,2800.00,2,0.05,490.00,42.00,Corporate
ORD-1027,2025-03-22,Europe,Office Supplies,Binders,210.00,8,0.1,48.00,11.00,Home Office
ORD-1028,2025-03-25,North America,Furniture,Tables,1600.00,2,0.35,-210.00,95.00,Corporate
ORD-1029,2025-03-28,Latin America,Technology,Smartphones,1150.00,1,0.0,230.00,22.00,Consumer
ORD-1030,2025-03-31,Europe,Office Supplies,Appliances,680.00,3,0.1,142.00,36.00,Corporate
ORD-1031,2025-04-03,North America,Technology,Laptops,3400.00,2,0.1,580.00,52.00,Corporate
ORD-1032,2025-04-06,Asia Pacific,Furniture,Chairs,720.00,4,0.0,144.00,28.00,Consumer
ORD-1033,2025-04-09,Europe,Office Supplies,Paper,110.00,18,0.05,33.00,8.00,Home Office
ORD-1034,2025-04-12,North America,Technology,Accessories,450.00,6,0.1,112.00,16.00,Corporate
ORD-1035,2025-04-16,Latin America,Furniture,Tables,980.00,2,0.25,-85.00,65.00,Consumer
ORD-1036,2025-04-20,Asia Pacific,Office Supplies,Binders,175.00,6,0.1,38.00,9.50,Home Office
ORD-1037,2025-04-23,North America,Furniture,Bookcases,1350.00,3,0.15,120.00,82.00,Corporate
ORD-1038,2025-04-26,Europe,Technology,Smartphones,1590.00,2,0.0,335.00,31.00,Consumer
ORD-1039,2025-04-29,North America,Office Supplies,Appliances,790.00,3,0.05,170.00,40.00,Corporate
ORD-1040,2025-05-02,Asia Pacific,Technology,Laptops,2950.00,2,0.1,480.00,48.00,Consumer`
  },
  {
    id: 'saas',
    name: 'SaaS Customer Churn & Metrics',
    category: 'B2B Software',
    badge: 'Executive',
    iconName: 'Activity',
    description: 'Customer subscription metrics: Monthly Recurring Revenue (MRR), Usage Hours, Support Tickets, NPS, and Churn Status.',
    csvContent: `Customer_ID,Plan_Type,MRR,Tenure_Months,Usage_Hours_Per_Month,Support_Tickets,NPS_Score,Country,Churn_Risk,Status
CUST-001,Enterprise,1200.00,24,185,1,9,USA,Low,Active
CUST-002,Pro,299.00,12,64,4,6,UK,Medium,Active
CUST-003,Starter,49.00,3,12,8,3,Germany,High,Churned
CUST-004,Enterprise,2500.00,36,240,0,10,USA,Low,Active
CUST-005,Pro,299.00,8,45,6,4,France,High,Active
CUST-006,Pro,299.00,18,110,2,8,Canada,Low,Active
CUST-007,Starter,49.00,1,5,11,2,USA,High,Churned
CUST-008,Enterprise,1800.00,15,190,3,7,UK,Medium,Active
CUST-009,Pro,299.00,22,140,1,9,Australia,Low,Active
CUST-0010,Starter,49.00,6,28,5,5,USA,Medium,Active
CUST-0011,Enterprise,3200.00,48,310,0,10,USA,Low,Active
CUST-0012,Pro,299.00,14,88,2,8,Germany,Low,Active
CUST-0013,Starter,49.00,2,8,9,3,UK,High,Churned
CUST-0014,Enterprise,1500.00,9,165,5,6,Canada,Medium,Active
CUST-0015,Pro,299.00,30,150,0,9,USA,Low,Active
CUST-0016,Pro,299.00,5,32,7,4,France,High,Churned
CUST-0017,Enterprise,4500.00,18,420,1,10,USA,Low,Active
CUST-0018,Starter,49.00,4,19,4,6,Australia,Medium,Active
CUST-0019,Pro,299.00,16,105,2,8,UK,Low,Active
CUST-0020,Enterprise,2100.00,21,215,2,9,Germany,Low,Active`
  },
  {
    id: 'marketing',
    name: 'Digital Marketing Campaign ROI',
    category: 'Marketing Analytics',
    badge: 'ROI Focus',
    iconName: 'BarChart3',
    description: 'Ad spend, impressions, click-through rates, lead conversions, cost per acquisition (CPA), and return on ad spend (ROAS).',
    csvContent: `Campaign_Name,Channel,Ad_Spend,Impressions,Clicks,Conversions,Revenue,CPA,ROAS,Status
Summer Surge 2025,Google Ads,12500.00,450000,13500,620,38500.00,20.16,3.08,Active
Retargeting Blast,Facebook Ads,8200.00,320000,11200,410,21400.00,20.00,2.61,Active
Search Intent Alpha,Google Ads,15000.00,210000,18900,1050,68200.00,14.28,4.55,Active
LinkedIn B2B Leads,LinkedIn,18500.00,120000,4800,220,54000.00,84.09,2.91,Active
TikTok Viral Push,TikTok,6000.00,850000,25500,380,14200.00,15.78,2.36,Completed
Email Nurture Series,Email,1200.00,95000,14250,890,32000.00,1.34,26.66,Active
Influencer Collab Q1,Instagram,9500.00,510000,17800,490,26500.00,19.38,2.78,Completed
YouTube Video Ads,YouTube,1400.00,620000,12400,210,18900.00,66.66,1.35,Paused
SEO Content Boost,Organic Search,3500.00,180000,16200,740,41500.00,4.72,11.85,Active
Black Friday Teaser,Facebook Ads,11000.00,480000,19200,830,49800.00,13.25,4.52,Completed`
  },
  {
    id: 'hr_performance',
    name: 'Employee Compensation & Performance',
    category: 'People Operations',
    badge: 'HR & Ops',
    iconName: 'Users',
    description: 'Workforce metrics: Department, Salary, Performance Rating, Overtime Hours, Projects Completed, and Retention.',
    csvContent: `Employee_ID,Department,Job_Level,Salary,Tenure_Years,Performance_Rating,Overtime_Hours,Projects_Completed,Remote_Status
EMP-101,Engineering,Senior,145000,4.5,4.8,32,14,Full Remote
EMP-102,Product,Lead,160000,6.0,4.9,20,18,Hybrid
EMP-103,Marketing,Mid,85000,2.1,3.9,10,9,On-site
EMP-104,Sales,Senior,120000,3.8,4.5,45,22,Hybrid
EMP-105,Engineering,Junior,92000,1.2,4.2,15,8,Full Remote
EMP-106,Design,Lead,135000,5.2,4.7,18,16,Hybrid
EMP-107,Customer Success,Mid,72000,2.8,4.1,25,12,Full Remote
EMP-108,Sales,Director,195000,8.5,4.9,50,30,Hybrid
EMP-109,Engineering,Lead,175000,7.1,4.9,28,24,Full Remote
EMP-110,HR,Mid,78000,3.0,4.0,5,10,On-site`
  }
];
