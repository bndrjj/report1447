/*
 * سكربت تقرير المتابعة الأسبوعي للمشرف التربوي.
 * يقوم هذا الملف ببناء جدول تقييم المجالات، تعبئة قوائم القطاعات
 * والأسبوع، وتغيير قوائم المشرفين والمدارس بناءً على القطاع المختار.
 * يسمح بحفظ السجلات في التخزين المحلي، وتصديرها إلى Excel، وطباعة تقرير واحد.
 */

(function() {
  'use strict';


  /**
   * قائمة القطاعات المتاحة في النموذج.
   */
  const sectors = [
    'الدمام',
    'الخبر',
    'القطيف',
    'رأس تنورة',
    'الجبيل',
    'بقيق',
    'النعيرية',
    'قرية العليا',
    'الخفجي',
    'حفر الباطن'
  ];

  /**
   * قائمة الأسابيع. يمكن تعديلها لإضافة أسابيع أخرى.
   */
  const weeks = [
    'الأسبوع التاسع عشر - ٢٠٢٦/٠١/٠٤ إلى ٢٠٢٦/٠١/٠٨',
    'الأسبوع العشرون - ٢٠٢٦/٠١/١١ إلى ٢٠٢٦/٠١/١٥',
    'الأسبوع الحادي والعشرون - ٢٠٢٦/٠١/١٨ إلى ٢٠٢٦/٠١/٢٢'
  ];

  /**
   * بيانات القطاع: لكل قطاع، مصفوفة أسماء المشرفين والمدارس الأساسية والإضافية.
   * تم إدراج بعض الأسماء كمثال لقطاع الدمام. ينبغي على المستخدم إضافة باقي الأسماء
   * والمدارس لبقية القطاعات إذا لزم الأمر.
   */
  const sectorData = {
    'الدمام': {
      supervisors: [
        'بندر بن سعيد القحطاني',
        'فهد بن محمد الشهري',
        'فائز بن علي الغامدي',
        'جهاد بن محمد آل طلحة',
        'مبارك بن فهد المرير'
      ],
      assignedSchools: [
        'مدرسة ابن كثير الابتدائية',
        'مدرسة النور المتوسطة',
        'مدرسة الفيصلية الثانوية'
      ],
      additionalSchools: [
        'مجمع منذر بن محمد',
        'مدرسة عبد الله بن عباس'
      ]
    },
    'الخبر': {
      supervisors: ['أحمد بن علي الغامدي', 'سعود بن محمد الدوسري'],
      assignedSchools: ['مدرسة الخبر الابتدائية', 'مدرسة النخبة الثانوية'],
      additionalSchools: ['مدرسة الخبر المتوسطة']
    },
    'القطيف': {
      supervisors: ['محمد بن خالد الزهراني', 'علي بن عبدالله الشمري'],
      assignedSchools: ['مدرسة القطيف الابتدائية'],
      additionalSchools: ['مدرسة سيهات المتوسطة']
    },
    'رأس تنورة': {
      supervisors: ['سلمان بن ناصر القحطاني'],
      assignedSchools: ['مدرسة رأس تنورة الثانوية'],
      additionalSchools: ['مدرسة رحيمة الابتدائية']
    },
    'الجبيل': {
      supervisors: ['خالد بن عبدالله البوعينين'],
      assignedSchools: ['مدرسة الجبيل الابتدائية'],
      additionalSchools: ['مدرسة الجبيل المتوسطة']
    },
    'بقيق': {
      supervisors: ['ناصر بن محمد الدوسري'],
      assignedSchools: ['مدرسة بقيق الابتدائية'],
      additionalSchools: ['مدرسة بقيق الثانوية']
    },
    'النعيرية': {
      supervisors: ['حمد بن علي الخالدي'],
      assignedSchools: ['مدرسة النعيرية الابتدائية'],
      additionalSchools: ['مدرسة النعيرية الثانوية']
    },
    'قرية العليا': {
      supervisors: ['عبدالله بن راشد العتيبي'],
      assignedSchools: ['مدرسة قرية العليا الابتدائية'],
      additionalSchools: ['مدرسة قرية العليا المتوسطة']
    },
    'الخفجي': {
      supervisors: ['علي بن محمد القحطاني'],
      assignedSchools: ['مدرسة الخفجي الابتدائية'],
      additionalSchools: ['مدرسة الخفجي الثانوية']
    },
    'حفر الباطن': {
      supervisors: ['فهد بن عبدالعزيز السبيعي'],
      assignedSchools: ['مدرسة حفر الباطن الابتدائية'],
      additionalSchools: ['مدرسة حفر الباطن المتوسطة']
    }
  };

  /**
   * تعريف المجالات التي سيتم تقييمها. كل مجال يحتوى على عنصر واحد كما في النماذج السابقة.
   */
  const domains = [
    { name: 'نواتج التعلم', items: ['نواتج التعلم'] },
    { name: 'التدريس', items: ['التدريس'] },
    { name: 'النشاط الطلابي', items: ['النشاط الطلابي'] },
    { name: 'التوجيه الطلابي', items: ['التوجيه الطلابي'] }
  ];

  // مصفوفة النصوص المقابلة للقيم 1، 2، 3 في تقييم المجالات
  const levelLabels = ['ضعيف', 'متوسط', 'متميز'];

  // كائن لحفظ التقييمات لكل مجال
  const evaluationData = {};

  /**
   * إنشاء جدول التقييم ووضع أزرار الاختيار لكل عنصر.
   */
  function buildEvaluationTable() {
    const table = document.getElementById('evaluationTable');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th>المجال</th><th>المستوى</th>';
    thead.appendChild(headerRow);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    domains.forEach((domain, dIndex) => {
      // لكل مجال نضيف صف
      const row = document.createElement('tr');
      const nameCell = document.createElement('td');
      nameCell.textContent = domain.name;
      row.appendChild(nameCell);
      const levelCell = document.createElement('td');
      domain.items.forEach((item, iIndex) => {
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.gap = '5px';
        levelLabels.forEach((label, level) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.textContent = label;
          button.className = 'level-btn';
          button.dataset.domainIndex = dIndex;
          button.dataset.itemIndex = iIndex;
          button.dataset.level = level + 1;
          button.addEventListener('click', () => setLevel(dIndex, iIndex, level + 1, button));
          container.appendChild(button);
        });
        levelCell.appendChild(container);
      });
      row.appendChild(levelCell);
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
  }

  /**
   * تعيين المستوى عند اختيار زر في جدول التقييم.
   * يحفظ التحديد ويقوم بتمييز الزر المختار.
   */
  function setLevel(domainIndex, itemIndex, level, button) {
    if (!evaluationData[domainIndex]) {
      evaluationData[domainIndex] = {};
    }
    evaluationData[domainIndex][itemIndex] = level;
    // إزالة التحديد السابق لهذا الصف
    const parentDiv = button.parentElement;
    Array.from(parentDiv.children).forEach(btn => {
      btn.classList.remove('selected');
    });
    button.classList.add('selected');
  }

  /**
   * تعبئة القوائم (القطاع، الأسبوع) بقيمها عند تحميل الصفحة.
   */
  function populateLists() {
    const sectorSelect = document.getElementById('sector');
    sectors.forEach(s => {
      const option = document.createElement('option');
      option.value = s;
      option.textContent = s;
      sectorSelect.appendChild(option);
    });
    const weekSelect = document.getElementById('week');
    weeks.forEach(w => {
      const option = document.createElement('option');
      option.value = w;
      option.textContent = w;
      weekSelect.appendChild(option);
    });
  }

  /**
   * تحديث القوائم المتعلقة بالقطاع عند تغييره.
   */
  function updateSectorData() {
    const sector = document.getElementById('sector').value;
    const supervisorSelect = document.getElementById('supervisor');
    const assignedSchoolSelect = document.getElementById('assignedSchool');
    const additionalSchoolSelect = document.getElementById('additionalSchool');
    // تفريغ القوائم الحالية
    supervisorSelect.innerHTML = '<option value="">اختر المشرف/ة</option>';
    assignedSchoolSelect.innerHTML = '<option value="">اختر المدرسة</option>';
    additionalSchoolSelect.innerHTML = '<option value="">اختر المدرسة الإضافية</option>';
    if (!sectorData[sector]) return;
    const data = sectorData[sector];
    data.supervisors.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      supervisorSelect.appendChild(opt);
    });
    data.assignedSchools.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      assignedSchoolSelect.appendChild(opt);
    });
    data.additionalSchools.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      additionalSchoolSelect.appendChild(opt);
    });
  }

  /**
   * جمع بيانات النموذج وتحويلها إلى كائن.
   */
  function collectFormData() {
    const data = {};
    data.sector = document.getElementById('sector').value;
    data.week = document.getElementById('week').value;
    data.date = document.getElementById('date').value;
    data.mission = document.getElementById('mission').value;
    data.supervisor = document.getElementById('supervisor').value;
    data.gender = document.getElementById('gender').value;
    data.educationStage = document.getElementById('educationStage').value;
    data.assignedSchool = document.getElementById('assignedSchool').value;
    data.additionalSchool = document.getElementById('additionalSchool').value;
    data.madrasati = document.getElementById('madrasati').value;
    data.attendanceTime = document.getElementById('attendanceTime').value;
    data.departureTime = document.getElementById('departureTime').value;
    // تقييم المجالات
    domains.forEach((domain, dIndex) => {
      const level = evaluationData[dIndex] && evaluationData[dIndex][0];
      data['eval_' + domain.name] = level || '';
    });
    // نصوص إضافية
    data.initiatives = document.getElementById('initiatives').value;
    data.recommendations = document.getElementById('recommendations').value;
    data.proposals = document.getElementById('proposals').value;
    data.supportAreas = document.getElementById('supportAreas').value;
    data.challenges = document.getElementById('challenges').value;
    data.remedies = document.getElementById('remedies').value;
    data.selfEvaluation = document.getElementById('selfEvaluation').value;
    data.yourView = document.getElementById('yourView').value;
    data.empowerment = document.getElementById('empowerment').value;
    return data;
  }

  /**
   * حفظ سجل النموذج في التخزين المحلي تحت المفتاح weeklyReportRecords.
   */
  function saveRecord() {
    const data = collectFormData();
    const records = JSON.parse(localStorage.getItem('weeklyReportRecords') || '[]');
    records.push(data);
    localStorage.setItem('weeklyReportRecords', JSON.stringify(records));
    alert('تم حفظ التقرير بنجاح.');
    resetForm();
  }

  /**
   * إعادة تعيين النموذج وإفراغ التقييمات.
   */
  function resetForm() {
    document.querySelector('form');
    // إعادة تعيين الحقول
    document.getElementById('sector').value = '';
    document.getElementById('week').value = '';
    document.getElementById('date').value = '';
    document.getElementById('mission').value = '';
    document.getElementById('supervisor').innerHTML = '<option value="">اختر المشرف/ة</option>';
    document.getElementById('gender').value = '';
    document.getElementById('educationStage').value = '';
    document.getElementById('assignedSchool').innerHTML = '<option value="">اختر المدرسة</option>';
    document.getElementById('additionalSchool').innerHTML = '<option value="">اختر المدرسة الإضافية</option>';
    document.getElementById('madrasati').value = '';
    document.getElementById('attendanceTime').value = '';
    document.getElementById('departureTime').value = '';
    document.getElementById('initiatives').value = '';
    document.getElementById('recommendations').value = '';
    document.getElementById('proposals').value = '';
    document.getElementById('supportAreas').value = '';
    document.getElementById('challenges').value = '';
    document.getElementById('remedies').value = '';
    document.getElementById('selfEvaluation').value = '';
    document.getElementById('yourView').value = '';
    document.getElementById('empowerment').value = '';
    // مسح التحديدات في جدول التقييم
    Object.keys(evaluationData).forEach(key => delete evaluationData[key]);
    document.querySelectorAll('.level-btn').forEach(btn => btn.classList.remove('selected'));
  }

  /**
   * تصدير كافة السجلات من التخزين المحلي إلى ملف Excel.
   */
  function exportToExcel() {
    const records = JSON.parse(localStorage.getItem('weeklyReportRecords') || '[]');
    if (records.length === 0) {
      alert('لا توجد تقارير محفوظة للتصدير.');
      return;
    }
    // إعداد رأس الجدول
    const headers = [
      'القطاع','الأسبوع الدراسي','التاريخ','المهمة','المشرف/ة','النوع','المرحلة الدراسية',
      'المدرسة','المدرسة الإضافية','تفعيل منصة مدرستي','وقت الحضور','وقت الانصراف'
    ];
    domains.forEach(domain => {
      headers.push('تقييم ' + domain.name);
    });
    headers.push('المبادرات المنفذة','التوصيات','المقترحات','مجالات الدعم','أبرز التحديات','أبرز المعالجات','التقييم الذاتي','وجهة نظرك','تمكين المدرسة');
    const aoa = [headers];
    records.forEach(rec => {
      const row = [];
      row.push(rec.sector);
      row.push(rec.week);
      row.push(rec.date);
      row.push(rec.mission);
      row.push(rec.supervisor);
      row.push(rec.gender);
      row.push(rec.educationStage);
      row.push(rec.assignedSchool);
      row.push(rec.additionalSchool);
      row.push(rec.madrasati);
      row.push(rec.attendanceTime);
      row.push(rec.departureTime);
      domains.forEach(domain => {
        const val = rec['eval_' + domain.name];
        row.push(val ? levelLabels[val - 1] : '');
      });
      row.push(rec.initiatives);
      row.push(rec.recommendations);
      row.push(rec.proposals);
      row.push(rec.supportAreas);
      row.push(rec.challenges);
      row.push(rec.remedies);
      row.push(rec.selfEvaluation ? levelLabels[rec.selfEvaluation - 1] : '');
      row.push(rec.yourView);
      row.push(rec.empowerment);
      aoa.push(row);
    });
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    XLSX.utils.book_append_sheet(wb, ws, 'التقارير');
    XLSX.writeFile(wb, 'weekly_report_records.xlsx');
  }

  /**
   * طباعة تقرير واحد بناءً على البيانات الحالية في النموذج.
   */
  function printReport() {
    const data = collectFormData();
    let html = '';
    html += '<html dir="rtl"><head><title>تقرير متابعة أسبوعي</title>';
    html += '<style>body{font-family:Tajawal,Arial,sans-serif;direction:rtl;padding:20px;} table{width:100%;border-collapse:collapse;margin-top:10px;} th,td{border:1px solid #ccc;padding:4px 6px;text-align:center;} th{background:#eaf4f3;}</style>';
    html += '</head><body>';
    html += '<h2>تقرير متابعة أسبوعي</h2>';
    function addLine(label, value) {
      if (value) html += '<p><strong>' + label + ':</strong> ' + value + '</p>';
    }
    addLine('القطاع', data.sector);
    addLine('الأسبوع الدراسي', data.week);
    addLine('التاريخ', data.date);
    addLine('المهمة', data.mission);
    addLine('المشرف/ة', data.supervisor);
    addLine('النوع', data.gender);
    addLine('المرحلة الدراسية', data.educationStage);
    addLine('المدرسة', data.assignedSchool);
    addLine('المدرسة الإضافية', data.additionalSchool);
    addLine('تفعيل منصة مدرستي', data.madrasati);
    addLine('وقت الحضور', data.attendanceTime);
    addLine('وقت الانصراف', data.departureTime);
    // جدول التقييم
    html += '<h3>تقييم المجالات</h3>';
    html += '<table><thead><tr><th>المجال</th><th>التقييم</th></tr></thead><tbody>';
    domains.forEach(domain => {
      const val = data['eval_' + domain.name];
      const levelText = val ? levelLabels[val - 1] : '';
      html += '<tr><td>' + domain.name + '</td><td>' + levelText + '</td></tr>';
    });
    html += '</tbody></table>';
    html += '<h3>تفاصيل أخرى</h3>';
    addLine('المبادرات المنفذة', data.initiatives);
    addLine('التوصيات', data.recommendations);
    addLine('المقترحات', data.proposals);
    addLine('مجالات الدعم', data.supportAreas);
    addLine('أبرز التحديات', data.challenges);
    addLine('أبرز المعالجات', data.remedies);
    addLine('التقييم الذاتي', data.selfEvaluation ? levelLabels[data.selfEvaluation - 1] : '');
    addLine('وجهة نظرك', data.yourView);
    addLine('تمكين المدرسة', data.empowerment);
    html += '</body></html>';
    const win = window.open('', '', 'width=900,height=700');
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  }

  // تهيئة النموذج مباشرة بعد تحميل السكربت بدلاً من انتظار DOMContentLoaded.
  // بما أن السكربت مُضمّن في نهاية ملف HTML، فإن العناصر تكون متاحة عند التشغيل.
  populateLists();
  buildEvaluationTable();
  // ربط الأحداث لعناصر النموذج
  document.getElementById('sector').addEventListener('change', updateSectorData);
  document.getElementById('saveButton').addEventListener('click', saveRecord);
  document.getElementById('exportButton').addEventListener('click', exportToExcel);
  document.getElementById('printButton').addEventListener('click', printReport);
})();