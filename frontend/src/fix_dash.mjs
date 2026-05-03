const fs = require('fs');
let s = fs.readFileSync('/root/gastroprime/frontend/src/ClientCompanyDashboard.tsx', 'utf-8');

// The line we want: Лимит/день followed by Дебет: and Кредит:
// Find and fix: missing </span> before Debit
s = s.replace(
  'Лимит/день: {data?.company?.dailyLimit ?? 0} \u20bd\n          <span',
  'Лимит/день: {data?.company?.dailyLimit ?? 0} \u20bd</span>\n          <span'
);

fs.writeFileSync('/root/gastroprime/frontend/src/ClientCompanyDashboard.tsx', s);
console.log('fixed');
