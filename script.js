/* EduWorld International - Free booking integrations */
const BOOKING_CONFIG = {
  primaryWhatsApp: "917378424424",
  secondaryWhatsApp: "919623738229",
  businessEmail: "shreeeduworldint@gmail.com",
  formspreeEndpoint: "", // paste free Formspree endpoint here
  googleSheetEndpoint: "", // paste free Google Apps Script Web App URL here
  calendarBookingLink: "" // paste free Calendly / Google Appointment Schedule link here
};

document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.querySelector('.menu-btn');
  const nav = document.querySelector('.nav-links');
  if (menuBtn && nav) menuBtn.addEventListener('click', () => nav.classList.toggle('mobile-open'));

  document.querySelectorAll('[data-open-meeting]').forEach(btn => btn.addEventListener('click', openMeeting));

  const modal = document.getElementById('meetingModal');
  const closeBtn = document.querySelector('.modal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeMeeting);
  if (modal) modal.addEventListener('click', e => { if (e.target === modal) closeMeeting(); });

  document.querySelectorAll('.faq-item').forEach(item => item.querySelector('.faq-q')?.addEventListener('click', () => item.classList.toggle('active')));

  const countrySearch = document.getElementById('countrySearch');
  const countryFilter = document.getElementById('countryFilter');
  if (countrySearch || countryFilter) {
    const cards = [...document.querySelectorAll('.country-filter-card')];
    const apply = () => {
      const q = (countrySearch?.value || '').toLowerCase().trim();
      const f = (countryFilter?.value || 'all').toLowerCase();
      cards.forEach(card => {
        const text = (card.dataset.search || '').toLowerCase();
        const matchQ = !q || text.includes(q);
        const matchF = f === 'all' || (card.dataset.country || '').toLowerCase() === f;
        card.style.display = matchQ && matchF ? '' : 'none';
      });
    };
    countrySearch?.addEventListener('input', apply);
    countryFilter?.addEventListener('change', apply);
  }

  document.querySelectorAll('#calendlyBtn').forEach(btn => {
    if (BOOKING_CONFIG.calendarBookingLink) btn.href = BOOKING_CONFIG.calendarBookingLink;
    else btn.addEventListener('click', e => { e.preventDefault(); showNotice('Add your free calendar booking link in script.js first.'); });
  });

  document.querySelectorAll('#meetingForm').forEach(form => form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    data.page = document.title;
    data.submittedAt = new Date().toLocaleString();

    await sendToFormspree(data);
    sendToGoogleSheet(data);
    openWhatsApp(data);

    closeMeeting();
    showNotice('WhatsApp enquiry opened. Add Formspree/Google Sheet/Calendar links in script.js for full free automation.');
    form.reset();
  }));

  setTimeout(() => openMeeting(), 7000);
  setInterval(() => { if (!modal?.classList.contains('show')) openMeeting(); }, 180000);
});

function buildText(data){
  return `New Free MBBS Counselling Request\n\nName: ${data.name || ''}\nPhone: ${data.phone || ''}\nEmail: ${data.email || ''}\nCountry: ${data.country || ''}\nPreferred Date: ${data.date || ''}\nPreferred Time: ${data.time || ''}\nMessage: ${data.message || ''}\nPage: ${data.page || ''}`;
}

function openWhatsApp(data){
  window.open(`https://wa.me/${BOOKING_CONFIG.primaryWhatsApp}?text=${encodeURIComponent(buildText(data))}`, '_blank', 'noopener,noreferrer');
}

async function sendToFormspree(data){
  if (!BOOKING_CONFIG.formspreeEndpoint) return;
  try {
    await fetch(BOOKING_CONFIG.formspreeEndpoint, {
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify(data)
    });
  } catch (err) { console.warn('Formspree failed', err); }
}

function sendToGoogleSheet(data){
  if (!BOOKING_CONFIG.googleSheetEndpoint) return;
  try {
    fetch(BOOKING_CONFIG.googleSheetEndpoint, {
      method:'POST',
      mode:'no-cors',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(data)
    });
  } catch (err) { console.warn('Google Sheet failed', err); }
}

function showNotice(message){
  const notice = document.getElementById('notice');
  if (!notice) return;
  notice.textContent = message;
  notice.classList.add('show');
  setTimeout(() => notice.classList.remove('show'), 4500);
}

function openMeeting(){ document.getElementById('meetingModal')?.classList.add('show'); }
function closeMeeting(){ document.getElementById('meetingModal')?.classList.remove('show'); }
