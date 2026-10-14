document.addEventListener('DOMContentLoaded', () => {
    initSeats();
    loadRegion('ub');
    renderReviews();
});

// GLOBAL STATE
let selectedSeats = [];
let userTickets = JSON.parse(localStorage.getItem('udet_tickets')) || [];
let selectedRating = 5;
let isEnglish = false;

const VIP_PRICE = 45000;
const REGULAR_PRICE = 25000;

// 1. ТАСАЛБАР СУУДАЛ СӨНГӨХ ЛОГИК
const seatsGrid = document.getElementById('seatsGrid');
const selectedSeatEl = document.getElementById('selectedSeat');
const totalPriceEl = document.getElementById('totalPrice');
const payBtn = document.getElementById('payBtn');

function initSeats() {
    seatsGrid.innerHTML = '';
    selectedSeats = [];
    updateSummary();

    for (let i = 1; i <= 24; i++) {
        const seat = document.createElement('div');
        seat.classList.add('seat');
        
        const isVip = i <= 8;
        const price = isVip ? VIP_PRICE : REGULAR_PRICE;

        if (isVip) {
            seat.classList.add('vip');
            seat.innerHTML = `<i class="fa-solid fa-crown" style="font-size:10px;"></i> ${i}`;
        } else {
            seat.innerText = i;
        }

        if (i === 6 || i === 7 || i === 15) {
            seat.classList.add('occupied');
        } else {
            seat.addEventListener('click', () => toggleSeatSelection(i, price, isVip, seat));
        }
        seatsGrid.appendChild(seat);
    }
}

function toggleSeatSelection(number, price, isVip, element) {
    const existingIndex = selectedSeats.findIndex(s => s.number === number);

    if (existingIndex > -1) {
        selectedSeats.splice(existingIndex, 1);
        element.classList.remove('selected');
    } else {
        selectedSeats.push({ number, price, isVip });
        element.classList.add('selected');
    }

    updateSummary();
}

function updateSummary() {
    if (selectedSeats.length === 0) {
        selectedSeatEl.innerText = "Сонгоогүй";
        totalPriceEl.innerText = "0₮";
        payBtn.disabled = true;
        return;
    }

    const seatNumbers = selectedSeats.map(s => `${s.number}${s.isVip ? ' (VIP)' : ''}`).join(', ');
    const total = selectedSeats.reduce((sum, s) => sum + s.price, 0);

    selectedSeatEl.innerText = `${seatNumbers} (${selectedSeats.length} суудал)`;
    totalPriceEl.innerText = `${total.toLocaleString()}₮`;
    payBtn.disabled = false;
}

// 2. QPAY MODAL & ХУУЛГА / ЦАХИМ БАРИМТ GENERATE
function openQPayModal() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');

    const total = selectedSeats.reduce((sum, s) => sum + s.price, 0);
    const seatNumbers = selectedSeats.map(s => `${s.number}${s.isVip ? ' (VIP)' : ''}`).join(', ');

    modalBody.innerHTML = `
        <h3 style="color: var(--accent-gold); margin-bottom: 10px; text-align:center;">QPay-ээр Төлбөр Төлөх</h3>
        <p>Сонгосон: <strong>${seatNumbers}</strong></p>
        <p>Нийт суудал: <strong>${selectedSeats.length} ширхэг</strong></p>
        <p>Нийт дүн: <strong style="color: var(--accent-gold); font-size: 1.2rem;">${total.toLocaleString()}₮</strong></p>
        <div style="text-align:center; margin: 20px 0;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=UDET_QPay_Demo" alt="QPay QR" style="border-radius: 8px; border: 2px solid var(--accent-gold);">
            <p style="font-size:0.8rem; color:var(--text-gray); margin-top:8px;">Банкны аппаараа QR кодыг уншуулна уу</p>
        </div>
        <button class="btn primary-btn full-width" onclick="confirmPayment()">
            <i class="fa-solid fa-check-circle"></i> Төлбөр шалгах & Баримт харах
        </button>
    `;
    modal.style.display = 'flex';
}

function confirmPayment() {
    const total = selectedSeats.reduce((sum, s) => sum + s.price, 0);
    const seatNumbers = selectedSeats.map(s => `${s.number}${s.isVip ? ' (VIP)' : ''}`).join(', ');
    const now = new Date();
    const invoiceNo = 'UDET-' + Math.floor(100000 + Math.random() * 900000);
    const dateStr = now.toLocaleDateString('mn-MN') + ' ' + now.toLocaleTimeString('mn-MN');

    const newTicket = {
        invoiceNo,
        play: 'Анна Каренина',
        seats: seatNumbers,
        count: selectedSeats.length,
        total,
        date: dateStr
    };

    userTickets.push(newTicket);
    localStorage.setItem('udet_tickets', JSON.stringify(userTickets));

    showReceipt(newTicket);
    initSeats();
}

// ТӨЛБӨРИЙН ЦАХИМ БАРИМТ ХАРУУЛАХ
function showReceipt(ticket) {
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `
        <div class="receipt-card">
            <div class="receipt-header">
                <h2>УЛСЫН ДРАМЫН ЭРДМИЙН ТЕАТР</h2>
                <p style="font-size:0.8rem; color:var(--text-gray);">ЦАХИМ ТАСАЛБАР БА ТӨЛБӨРИЙН БАРИМТ</p>
            </div>
            <div class="receipt-row"><span>Баримтын нийт дугаар:</span> <strong>${ticket.invoiceNo}</strong></div>
            <div class="receipt-row"><span>Огноо:</span> <span>${ticket.date}</span></div>
            <div class="receipt-row"><span>Жүжгийн нэр:</span> <strong>${ticket.play}</strong></div>
            <div class="receipt-row"><span>Суудал:</span> <strong>${ticket.seats}</strong></div>
            <div class="receipt-row"><span>Төлбөрийн хэлбэр:</span> <span>QPay / Онлайн</span></div>
            <div class="receipt-row receipt-total"><span>Нийт төлсөн:</span> <span style="color:var(--accent-gold);">${ticket.total.toLocaleString()}₮</span></div>
            
            <div class="receipt-qr">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${ticket.invoiceNo}" alt="Ticket QR">
                <p style="font-size:0.75rem; color:var(--text-gray); margin-top:5px;">Үүдэнд уншуулах QR код</p>
            </div>
            <button class="btn primary-btn full-width" onclick="window.print()">
                <i class="fa-solid fa-print"></i> Баримт хэвлэх / PDF хадгалах
            </button>
        </div>
    `;
}

// 3. МИНИЙ ТЕАТР (ХЭРЭГЛЭГЧИЙН ПРОФАЙЛ & АВСАН ТАСАЛБАРУУД)
function openProfileModal() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');

    if (userTickets.length === 0) {
        modalBody.innerHTML = `
            <h3 style="color: var(--accent-gold); margin-bottom: 15px;"><i class="fa-solid fa-user"></i> Миний Театр</h3>
            <p style="color: var(--text-gray); text-align:center; padding: 20px 0;">Танд одоогоор худалдаж авсан тасалбар байхгүй байна.</p>
        `;
    } else {
        let ticketListHtml = userTickets.map((t, idx) => `
            <div style="background:rgba(255,255,255,0.03); padding:15px; border-radius:8px; border:1px solid var(--border-color); margin-bottom:12px;">
                <div style="display:flex; justify-space-between; margin-bottom:5px;">
                    <strong style="color:var(--accent-gold);">${t.play}</strong>
                    <span style="font-size:0.8rem; color:var(--text-gray);">${t.date}</span>
                </div>
                <p style="font-size:0.85rem;">Суудал: ${t.seats}</p>
                <p style="font-size:0.85rem; color:var(--accent-gold);">Нийт: ${t.total.toLocaleString()}₮</p>
                <button class="btn secondary-btn" style="padding:4px 10px; font-size:0.75rem; margin-top:8px;" onclick='showReceipt(${JSON.stringify(t)})'>Баримт харах</button>
            </div>
        `).join('');

        modalBody.innerHTML = `
            <h3 style="color: var(--accent-gold); margin-bottom: 15px;"><i class="fa-solid fa-ticket"></i> Худалдаж авсан тасалбарууд</h3>
            ${ticketListHtml}
        `;
    }
    modal.style.display = 'flex';
}

// 4. ҮЗЭГЧДИЙН СЭТГЭГДЭЛ & ҮНЭЛГЭЭ
let reviews = [
    { name: "Б.Бат-Эрдэнэ", play: "Анна Каренина", rating: 5, comment: "Жүжигчдийн тоглолт, тайз засал үнэхээр дээд түвшнийх байлаа. Баярлалаа!" },
    { name: "М.Сарнай", play: "Тамгагүй Төр", rating: 5, comment: "Тайзны хөгжим, хувцас хэрэглэл гайхалтай. Заавал үзэх бүтээл." }
];

function renderReviews() {
    const grid = document.getElementById('reviewsGrid');
    grid.innerHTML = reviews.map(r => `
        <div class="review-card">
            <div class="review-header">
                <strong>${r.name}</strong>
                <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
            </div>
            <p style="font-size:0.85rem; color:var(--accent-gold); margin-bottom:5px;">Жүжиг: ${r.play}</p>
            <p style="font-size:0.9rem; color:var(--text-gray);">${r.comment}</p>
        </div>
    `).join('');
}

function setRating(val) {
    selectedRating = val;
    document.querySelectorAll('.star-rating .star').forEach((star, idx) => {
        if (idx < val) star.classList.add('active');
        else star.classList.remove('active');
    });
}

function submitReview(e) {
    e.preventDefault();
    const name = document.getElementById('reviewerName').value;
    const play = document.getElementById('playName').value;
    const comment = document.getElementById('reviewComment').value;

    reviews.unshift({ name, play, rating: selectedRating, comment });
    renderReviews();
    e.target.reset();
    setRating(5);
    alert('Таны сэтгэгдэл амжилттай нэмэгдлээ!');
}

// 5. ОЛОН ХЭЛНИЙ СОНГОЛТ (MN / EN)
function toggleLanguage() {
    isEnglish = !isEnglish;
    document.getElementById('langText').innerText = isEnglish ? 'MN' : 'EN';
    
    document.querySelectorAll('[data-lang="mn"]').forEach(el => {
        el.classList.toggle('hidden', isEnglish);
    });
    document.querySelectorAll('[data-lang="en"]').forEach(el => {
        el.classList.toggle('hidden', !isEnglish);
    });
}

// OTHER UTILS
function openRentalModal(title, price) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `
        <h3 style="color: var(--accent-gold); margin-bottom: 10px;">🎬 ${title}</h3>
        <p>Түрээсийн хугацаа: <strong>48 цаг</strong></p>
        <p>Чанар: <strong>Full HD / DRM Хамгаалалттай</strong></p>
        <p>Үнэ: <strong style="color: var(--accent-gold);">${price.toLocaleString()}₮</strong></p>
        <button class="btn primary-btn full-width" style="margin-top:20px;" onclick="alert('Онлайн үзэх эрх идэвхжлээ!')">
            <i class="fa-solid fa-credit-card"></i> Үзэх Эрх Авах
        </button>
    `;
    modal.style.display = 'flex';
}

function openTrailerModal() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `
        <h3 style="color: var(--accent-gold); margin-bottom: 15px;">"Анна Каренина" Трейлер</h3>
        <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:8px;">
            <iframe style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" 
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ" allowfullscreen></iframe>
        </div>
    `;
    modal.style.display = 'flex';
}

const regionData = {
    ub: { name: "Улсын Драмын Эрдмийн Театр", city: "Улаанбаатар хот", desc: "1931 онд байгуулагдсан Монгол улсын драмын урлагийн цөм театр." },
    arkhangai: { name: "Архангай аймгийн Хөгжимт Драмын Театр", city: "Архангай, Цэцэрлэг хот", desc: "Арын сайхан хангай нутгийн соёл урлагийн голомт болсон анхны орон нутгийн театруудын нэг." },
    khovsgol: { name: "Хөвсгөл аймгийн 'Хонгороо' Театр", city: "Хөвсгөл, Мөрөн хот", desc: "Хойд бүсийн хүүхэд залуучууд, ард иргэдэд урлагийн боловсрол олгох төв." },
    dornod: { name: "Дорнод аймгийн Хөгжимт Драмын Театр", city: "Дорнод, Чойбалсан хот", desc: "Зүүн бүсийн уран бүтээлчдийн түүхэн өв, театр урлагийн уурхай." }
};

function loadRegion(key, event) {
    const info = regionData[key];
    const infoContainer = document.getElementById('regionInfo');
    
    if (event) {
        document.querySelectorAll('.region-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
    }

    infoContainer.innerHTML = `
        <h3 style="color: var(--accent-gold); margin-bottom: 10px;">${info.name}</h3>
        <p style="margin-bottom: 8px;"><strong>Байршил:</strong> ${info.city}</p>
        <p style="color: var(--text-gray);">${info.desc}</p>
    `;
}

function showYearDetails(year) {
    alert(`${year} оны театрын ховор архивын зураг, сонин нийтлэлүүдийн сан нээгдэж байна.`);
}

function submitScript(event) {
    event.preventDefault();
    alert("Таны жүжгийн зохиолыг Уран сайхны зөвлөл хүлээн авлаа. Баярлаلاа!");
    event.target.reset();
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}