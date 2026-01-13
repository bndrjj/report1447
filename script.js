/*
 * سكربت جافا سكربت للتقرير اليومي لمقدم خدمة دعم التميز المدرسي.
 * يقوم ببناء جدول التقييم للمجالات، وحفظ السجل في localStorage، وتصديره إلى Excel، وطباعة تقرير.
 */

(function() {
  // المجالات المطلوبة في التقرير اليومي
  const domains = [
    { name: 'مجال نواتج التعلم', items: ['نواتج التعلم'] },
    { name: 'مجال التدريس', items: ['التدريس'] },
    { name: 'مجال النشاط الطلابي', items: ['النشاط الطلابي'] },
    { name: 'مجال التوجيه الطلابي', items: ['التوجيه الطلابي'] }
  ];
  const levelLabels = ['ضعيف', 'متوسط', 'متميز'];
  // كائن لحفظ قيم التقييم
  const evaluationData = {};

  /**
   * بناء جدول التقييم من المجالات.
   */
  function buildEvaluationTable() {
    const table = document.getElementById('evaluationTable');
    // رأس الجدول
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th>م</th><th>المجال</th><th>العنصر</th><th>مستوى الأداء</th>';
    table.appendChild(headerRow);
    domains.forEach((domain, dIndex) => {
      domain.items.forEach((item, iIndex) => {
        const row = document.createElement('tr');
        const tdNo = document.createElement('td');
        tdNo.textContent = (dIndex + 1).toString();
        row.appendChild(tdNo);
        // اسم المجال
        const tdDomain = document.createElement('td');
        tdDomain.textContent = domain.name;
        row.appendChild(tdDomain);
        // اسم العنصر (لكل مجال عنصر واحد)
        const tdItem = document.createElement('td');
        tdItem.textContent = item;
        row.appendChild(tdItem);
        // أزرار التقييم
        const tdOptions = document.createElement('td');
        const container = document.createElement('div');
        container.className = 'option-buttons';
        levelLabels.forEach((label, levelIndex) => {
          const btn = document.createElement('button');
          btn.textContent = label;
          btn.addEventListener('click', function() {
            setLevel(dIndex, iIndex, levelIndex + 1, btn, container);
          });
          container.appendChild(btn);
        });
        tdOptions.appendChild(container);
        row.appendChild(tdOptions);
        table.appendChild(row);
      });
    });
  }

  /**
   * تعيين قيمة التقييم وتحديث حالة الأزرار.
   */
  function setLevel(dIndex, iIndex, level, btn, container) {
    if (!evaluationData[dIndex]) evaluationData[dIndex] = {};
    evaluationData[dIndex][iIndex] = level;
    Array.from(container.children).forEach(function(b) {
      b.classList.remove('selected');
    });
    btn.classList.add('selected');
  }

  /**
   * جمع بيانات النموذج في كائن واحد.
   */
  function collectFormData() {
    return {
      id: Date.now(),
      sector: document.getElementById('sector').value.trim(),
      date: document.getElementById('date').value,
      day: document.getElementById('day').value.trim(),
      week: document.getElementById('week').value.trim(),
      supervisor: document.getElementById('supervisor').value.trim(),
      mission: document.getElementById('mission').value.trim(),
      school: document.getElementById('school').value.trim(),
      serviceType: document.getElementById('serviceType').value.trim(),
      schoolType: document.getElementById('schoolType').value.trim(),
      educationStage: document.getElementById('educationStage').value.trim(),
      additionalSchool: document.getElementById('additionalSchool').value.trim(),
      assignedSchoolName: document.getElementById('assignedSchoolName').value.trim(),
      madrasati: document.getElementById('madrasati').value,
      attendanceTime: document.getElementById('attendanceTime').value,
      departureTime: document.getElementById('departureTime').value,
      supervisoryExperiences: document.getElementById('supervisoryExperiences').value.trim(),
      initiatives: document.getElementById('initiatives').value.trim(),
      recommendations: document.getElementById('recommendations').value.trim(),
      proposals: document.getElementById('proposals').value.trim(),
      supportAreas: document.getElementById('supportAreas').value.trim(),
      challenges: document.getElementById('challenges').value.trim(),
      remedies: document.getElementById('remedies').value.trim(),
      selfEvaluation: document.getElementById('selfEvaluation').value,
      yourView: document.getElementById('yourView').value.trim(),
      empowerment: document.getElementById('empowerment').value.trim(),
      evaluation: JSON.parse(JSON.stringify(evaluationData))
    };
  }

  /**
   * حفظ سجل التقرير في localStorage.
   */
  function saveRecord() {
    const record = collectFormData();
    if (!record.supervisor || !record.school) {
      alert('يرجى تعبئة المشرف والمدرسة قبل الحفظ.');
      return;
    }
    const records = JSON.parse(localStorage.getItem('dailyReportRecords') || '[]');
    records.push(record);
    localStorage.setItem('dailyReportRecords', JSON.stringify(records));
    alert('تم حفظ التقرير بنجاح!');
    resetForm();
  }

  /**
   * إعادة تعيين البيانات للنموذج.
   */
  function resetForm() {
    // اعادة تعيين الحقول النصية
    document.querySelectorAll('.form-grid input, .form-grid select').forEach(function(input) {
      if (input.type === 'date' || input.type === 'time') {
        input.value = '';
      } else {
        input.value = '';
      }
    });
    document.querySelectorAll('textarea').forEach(function(tx) { tx.value = ''; });
    document.getElementById('selfEvaluation').value = '';
    // إعادة تعيين التقييم
    Object.keys(evaluationData).forEach(function(key) { delete evaluationData[key]; });
    const selectedButtons = document.querySelectorAll('#evaluationTable .selected');
    selectedButtons.forEach(function(btn) { btn.classList.remove('selected'); });
  }

  /**
   * تصدير السجلات إلى ملف Excel.
   */
  function exportToExcel() {
    const records = JSON.parse(localStorage.getItem('dailyReportRecords') || '[]');
    if (records.length === 0) {
      alert('لا توجد سجلات للتصدير.');
      return;
    }
    const aoa = [];
    // العناوين الأساسية
    const header = [
      'القطاع','التاريخ','اليوم','الأسبوع','المشرف','المهمة','المدرسة','نوع الخدمة','نوع المدرسة','المرحلة الدراسية','المدرسة الإضافية','اسم المدرسة المكلفة','تفعيل منصة مدرستي','وقت الحضور','وقت الانصراف'
    ];
    // عناوين التقييم لكل مجال
    domains.forEach(domain => {
      header.push(domain.name);
    });
    // عناوين الحقول النصية الأخرى
    header.push('الخبرات الاشرافية','المبادرات المنفذة','التوصيات المقدمة','المقترحات للفريق التنفيذي','مجالات الدعم','أبرز التحديات','أبرز المعالجات','التقييم الذاتي','وجهة نظرك','تمكين المدرسة');
    aoa.push(header);
    records.forEach(rec => {
      const row = [
        rec.sector,
        rec.date,
        rec.day,
        rec.week,
        rec.supervisor,
        rec.mission,
        rec.school,
        rec.serviceType,
        rec.schoolType,
        rec.educationStage,
        rec.additionalSchool,
        rec.assignedSchoolName,
        rec.madrasati,
        rec.attendanceTime,
        rec.departureTime
      ];
      domains.forEach((domain, dIndex) => {
        const levelValue = (rec.evaluation && rec.evaluation[dIndex] && rec.evaluation[dIndex][0]) || '';
        row.push(levelValue);
      });
      row.push(
        rec.supervisoryExperiences,
        rec.initiatives,
        rec.recommendations,
        rec.proposals,
        rec.supportAreas,
        rec.challenges,
        rec.remedies,
        rec.selfEvaluation,
        rec.yourView,
        rec.empowerment
      );
      aoa.push(row);
    });
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    XLSX.utils.book_append_sheet(wb, ws, 'تقارير');
    XLSX.writeFile(wb, 'daily_report3_records.xlsx');
  }

  /**
   * طباعة تقرير واحد (الحالي في النموذج).
   */
  function printReport() {
    const data = collectFormData();
    let html = '';
    html += '<html dir="rtl"><head><title>تقرير يومي دعم التميز المدرسي-٣</title>';
    html += '<style>body{font-family:Tajawal,Arial,sans-serif;direction:rtl;padding:20px;} table{width:100%;border-collapse:collapse;margin-top:10px;} th,td{border:1px solid #ccc;padding:4px 6px;text-align:center;} th{background:#e8f4f1;}</style>';
    html += '</head><body>';
    html += '<h2>تقرير يومي دعم التميز المدرسي-٣</h2>';
    html += '<p><strong>المشرف:</strong> ' + data.supervisor + '</p>';
    html += '<p><strong>المدرسة:</strong> ' + data.school + '</p>';
    html += '<p><strong>التاريخ:</strong> ' + data.date + '</p>';
    html += '<h3>تقييم المجالات</h3>';
    html += '<table><thead><tr><th>المجال</th><th>التقييم</th></tr></thead><tbody>';
    domains.forEach((domain, dIndex) => {
      const levelValue = evaluationData[dIndex] && evaluationData[dIndex][0];
      const levelText = levelValue ? levelLabels[levelValue - 1] : '';
      html += '<tr><td>' + domain.name + '</td><td>' + levelText + '</td></tr>';
    });
    html += '</tbody></table>';
    html += '<h3>تفاصيل أخرى</h3>';
    function addLine(label, value) {
      if (value) html += '<p><strong>' + label + ':</strong> ' + value + '</p>';
    }
    addLine('الخبرات الاشرافية', data.supervisoryExperiences);
    addLine('المبادرات المنفذة', data.initiatives);
    addLine('التوصيات المقدمة', data.recommendations);
    addLine('المقترحات للفريق التنفيذي', data.proposals);
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

  // ربط الأحداث عند تحميل الصفحة
  document.addEventListener('DOMContentLoaded', function() {
    buildEvaluationTable();
    document.getElementById('saveButton').addEventListener('click', saveRecord);
    document.getElementById('exportButton').addEventListener('click', exportToExcel);
    document.getElementById('printButton').addEventListener('click', printReport);
  });
})();