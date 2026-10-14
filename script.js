document.addEventListener('DOMContentLoaded', () => {
    initSeats();
    renderReviews();
    startCountdown();
});

// GLOBAL STATE
let currentPlay = 'Анна Каренина';
let selectedSeats = [];
let userTickets = JSON.parse(localStorage.getItem('udet_tickets')) || [];
let selectedRating = 5;

const VIP_PRICE = 45000;
const REGULAR_PRICE = 25000;

// 1. LIVE COUNTDOWN
function startCountdown() {
    const playDate = new Date('2026-10-18T19:00:00').getTime();

    setInterval(() => {
        const now = new Date().getTime();
        const distance = playDate - now;

        if (distance < 0) return;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');

        if (daysEl) daysEl.innerText = days < 10 ? '0' + days : days;
        if (hoursEl) hoursEl.innerText = hours < 10 ? '0' + hours : hours;
        if (minutesEl) minutesEl.innerText = minutes < 10 ? '0' + minutes : minutes;
        if (secondsEl) secondsEl.innerText = seconds < 10 ? '0' + seconds : seconds;
    }, 1000);
}

// ЖҮЖИГ СУУДЛААР СОЛИХ
function changePlay() {
    const playSelect = document.getElementById('playSelect');
    if (playSelect) {
        currentPlay = playSelect.value;
    }
    initSeats();
}

// 2. SEAT SELECTION & OCCUPIED LOGIC (ЖҮЖИГ ТУС БҮРД САЛГАХ)
const seatsGrid = document.getElementById('seatsGrid');
const selectedSeatEl = document.getElementById('selectedSeat');
const totalPriceEl = document.getElementById('totalPrice');
const payBtn = document.getElementById('payBtn');

function initSeats() {
    if (!seatsGrid) return;
    seatsGrid.innerHTML = '';
    selectedSeats = [];
    updateSummary();

    let bookedSeatNumbers = [];
    userTickets.forEach(t => {
        const playName = t.play || 'Анна Каренина';
        const status = t.status || 'Идэвхтэй';
        
        if (playName === currentPlay && status === 'Идэвхтэй') {
            const numbers = t.seats.match(/\d+/g);
            if (numbers) {
                bookedSeatNumbers.push(...numbers.map(Number));
            }
        }
    });

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

        if (bookedSeatNumbers.includes(i)) {
            seat.classList.add('occupied');
            seat.title = `${currentPlay} жүжиг дээр энэ суудал зарагдсан байна`;
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
    if (!selectedSeatEl || !totalPriceEl || !payBtn) return;

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

// 3. QPAY & RECEIPT GENERATOR
function openQPayModal() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');

    const total = selectedSeats.reduce((sum, s) => sum + s.price, 0);
    const seatNumbers = selectedSeats.map(s => `${s.number}${s.isVip ? ' (VIP)' : ''}`).join(', ');

    modalBody.innerHTML = `
        <h3 style="color: var(--accent-gold); margin-bottom: 10px; text-align:center;">QPay-ээр Төлбөр Төлөх</h3>
        <p>Жүжиг: <strong>${currentPlay}</strong></p>
        <p>Сонгосон: <strong>${seatNumbers}</strong></p>
        <p>Нийт дүн: <strong style="color: var(--accent-gold); font-size: 1.2rem;">${total.toLocaleString()}₮</strong></p>
        <div style="text-align:center; margin: 20px 0;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=UDET_QPay_Demo" alt="QPay QR" style="border-radius: 8px; border: 2px solid var(--accent-gold);">
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
        play: currentPlay,
        playDate: currentPlay === 'Анна Каренина' ? '2026-10-18 19:00' : (currentPlay === 'Гамлет' ? '2026-10-22 18:30' : '2026-10-28 19:00'),
        seats: seatNumbers,
        count: selectedSeats.length,
        total,
        date: dateStr,
        status: 'Идэвхтэй'
    };

    userTickets.push(newTicket);
    localStorage.setItem('udet_tickets', JSON.stringify(userTickets));

    showReceipt(newTicket);
    initSeats();
}

function showReceipt(ticket) {
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `
        <div class="receipt-card">
            <div class="receipt-header">
                <h2>УЛСЫН ДРАМЫН ЭРДМИЙН ТЕАТР</h2>
                <p style="font-size:0.8rem; color:var(--text-gray);">ЦАХИМ ТАСАЛБАР БА ТӨЛБӨРИЙН БАРИМТ</p>
            </div>
            <div class="receipt-row"><span>Дугаар:</span> <strong>${ticket.invoiceNo}</strong></div>
            <div class="receipt-row"><span>Огноо:</span> <span>${ticket.date}</span></div>
            <div class="receipt-row"><span>Жүжиг:</span> <strong>${ticket.play}</strong></div>
            <div class="receipt-row"><span>Тоглох өдөр:</span> <strong>${ticket.playDate}</strong></div>
            <div class="receipt-row"><span>Суудал:</span> <strong>${ticket.seats}</strong></div>
            <div class="receipt-row receipt-total"><span>Нийт төлсөн:</span> <span style="color:var(--accent-gold);">${(ticket.total || 0).toLocaleString()}₮</span></div>
            
            <div class="receipt-qr">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${ticket.invoiceNo}" alt="Ticket QR">
            </div>
            <button class="btn primary-btn full-width" onclick="window.print()">
                <i class="fa-solid fa-print"></i> Баримт Хэвлэх / PDF
            </button>
        </div>
    `;
}

// 4. PROFILE & TICKET REFUND
function openProfileModal() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');

    if (userTickets.length === 0) {
        modalBody.innerHTML = `
            <h3 style="color: var(--accent-gold); margin-bottom: 15px;"><i class="fa-solid fa-user-shield"></i> Миний Театр</h3>
            <p style="color: var(--text-gray); text-align:center; padding: 20px 0;">Танд одоогоор худалдаж авсан тасалбар байхгүй байна.</p>
        `;
    } else {
        let ticketListHtml = userTickets.map((t, idx) => {
            const playDate = t.playDate || '2026-10-18 19:00';
            const status = t.status || 'Идэвхтэй';
            
            return `
                <div style="background:rgba(255,255,255,0.03); padding:15px; border-radius:8px; border:1px solid var(--border-color); margin-bottom:12px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                        <strong style="color:var(--accent-gold);">${t.play || 'Анна Каренина'}</strong>
                        <span class="refund-badge">${status}</span>
                    </div>
                    <p style="font-size:0.85rem;">Тоглох: ${playDate}</p>
                    <p style="font-size:0.85rem;">Суудал: ${t.seats}</p>
                    <p style="font-size:0.85rem; color:var(--accent-gold);">Үнэ: ${(t.total || 0).toLocaleString()}₮</p>
                    
                    <div style="display:flex; gap:10px; margin-top:10px;">
                        <button class="btn secondary-btn" style="padding:4px 10px; font-size:0.75rem;" onclick='showReceipt(${JSON.stringify(t)})'>Баримт</button>
                        ${status === 'Идэвхтэй' ? `<button class="btn primary-btn" style="padding:4px 10px; font-size:0.75rem; background:#660000;" onclick="processRefund(${idx})">Буцаах</button>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        modalBody.innerHTML = `
            <h3 style="color: var(--accent-gold); margin-bottom: 15px;"><i class="fa-solid fa-ticket"></i> Миний Тасалбарууд</h3>
            ${ticketListHtml}
            <button class="btn secondary-btn full-width" style="margin-top:10px; font-size:0.8rem;" onclick="clearAllTickets()">Түүх Цэвэрлэх</button>
        `;
    }
    modal.style.display = 'flex';
}

function clearAllTickets() {
    if (confirm("Та бүх тасалбарын түүхийг цэвэрлэхдээ итгэлтэй байна уу?")) {
        localStorage.removeItem('udet_tickets');
        userTickets = [];
        initSeats();
        openProfileModal();
    }
}

function processRefund(index) {
    const ticket = userTickets[index];
    const confirmRefund = confirm(`Та "${ticket.play}" жүжгийн ${ticket.seats} суудлын тасалбарыг буцаахдаа итгэлтэй байна уу?\n\nБуцаасан суудал тухайн жүжиг дээр чөлөөлөгдөх болно.`);

    if (confirmRefund) {
        userTickets.splice(index, 1);
        localStorage.setItem('udet_tickets', JSON.stringify(userTickets));
        alert('Тасалбар амжилттай буцаагдлаа.');
        initSeats();
        openProfileModal();
    }
}

// 5. REVIEWS & RATINGS
let reviews = [
    { name: "Б.Бат-Эрдэнэ", play: "Анна Каренина", rating: 5, comment: "Жүжигчдийн тоглолт, тайз засал үнэхээр дээд түвшнийх байлаа. Баярлалаа!" },
    { name: "М.Сарнай", play: "Тамгагүй Төр", rating: 5, comment: "Тайзны хөгжим, хувцас хэрэглэл гайхалтай. Заавал үзэх бүтээл." }
];

function renderReviews() {
    const grid = document.getElementById('reviewsGrid');
    if (!grid) return;
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
        if (idx < val) star.style.color = 'var(--accent-gold)';
        else star.style.color = '#444';
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
    alert('Таны сэтгэгдэл амжилттай нэмэгдлээ!');
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

function showYearDetails(year) {
    alert(`${year} оны театрын ховор архивын зураг, сонин нийтлэлүүдийн сан нээгдэж байна.`);
}

function closeModal() { 
    const modal = document.getElementById('modal');
    if (modal) modal.style.display = 'none'; 
}

function scrollToSection(id) { 
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' }); 
}