// Birthday Website JavaScript - Music Player
// Tất cả các hiệu ứng và tương tác được xử lý ở đây

document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo các hiệu ứng khi trang load
    initializeAnimations();
    autoResizeText();
    initializeCarousel();
    initializeSurpriseButton();
    initializeMusicPlayer();
    initializeImageModal();
    createConfetti();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(autoResizeText, 80);
    });
    window.addEventListener('orientationchange', autoResizeText);
});

function autoResizeText() {
    const titleEl = document.getElementById('main-title');
    const nameEl = document.getElementById('title-text');
    if (!titleEl || !nameEl) return;

    const minPx = 28;
    const maxPx = 66;
    const wrapperEl = titleEl.parentElement || titleEl;
    const wrapperStyle = window.getComputedStyle(wrapperEl);
    const horizontalPadding =
        parseFloat(wrapperStyle.paddingLeft || '0') +
        parseFloat(wrapperStyle.paddingRight || '0');

    let iconsWidth = 0;
    titleEl.querySelectorAll('.title-icon').forEach((iconEl) => {
        iconsWidth += iconEl.getBoundingClientRect().width;
    });

    const titleGap = parseFloat(window.getComputedStyle(titleEl).columnGap || '0');
    const reserveSpace = iconsWidth + titleGap * 2 + 18;
    const targetWidth = Math.max(120, wrapperEl.clientWidth - horizontalPadding - reserveSpace);

    nameEl.style.fontSize = `${maxPx}px`;
    nameEl.style.transform = 'scale(1)';
    nameEl.style.maxWidth = `${targetWidth}px`;

    if (nameEl.scrollWidth <= targetWidth) return;

    const ratio = targetWidth / nameEl.scrollWidth;
    const nextSize = Math.floor(maxPx * ratio);
    const finalSize = Math.max(minPx, nextSize);
    nameEl.style.fontSize = `${finalSize}px`;

    if (finalSize === minPx && nameEl.scrollWidth > targetWidth) {
        const safeScale = Math.max(0.82, targetWidth / nameEl.scrollWidth);
        nameEl.style.transform = `scale(${safeScale})`;
    }
}

/**
 * Nhạc nền RiverFlowsinYou.mp4 — tự phát khi vào trang.
 * Trình duyệt thường chặn autoplay có tiếng: thử bật tiếng trước;
 * nếu lỗi thì phát muted rồi bật tiếng sau lần tương tác đầu tiên.
 */
function initializeMusicPlayer() {
    const v = document.getElementById('bgMusic');
    if (!v) return;

    v.volume = 0.65;

    function bindUnlockOnce() {
        const unlock = function () {
            v.muted = false;
            v.play().catch(function () {});
            document.removeEventListener('pointerdown', unlock);
            document.removeEventListener('touchstart', unlock);
            document.removeEventListener('keydown', unlock);
        };
        document.addEventListener('pointerdown', unlock, { once: true });
        document.addEventListener('touchstart', unlock, { once: true, passive: true });
        document.addEventListener('keydown', unlock, { once: true });
    }

    async function startAutoplay() {
        v.muted = false;
        try {
            await v.play();
            return;
        } catch (e) {
            /* autoplay có tiếng bị chặn */
        }

        v.muted = true;
        try {
            await v.play();
            bindUnlockOnce();
        } catch (e2) {
            bindUnlockOnce();
        }
    }

    if (v.readyState >= 2) {
        startAutoplay();
    } else {
        v.addEventListener(
            'canplay',
            function onReady() {
                v.removeEventListener('canplay', onReady);
                startAutoplay();
            },
            { once: true }
        );
    }
}

// Tạo nhạc Happy Birthday bằng Web Audio API
function playHappyBirthdaySong() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Nốt nhạc Happy Birthday (tần số Hz)
        const notes = [
            { freq: 261.63, duration: 0.5 }, // C4
            { freq: 261.63, duration: 0.5 }, // C4
            { freq: 293.66, duration: 1.0 }, // D4
            { freq: 261.63, duration: 1.0 }, // C4
            { freq: 349.23, duration: 1.0 }, // F4
            { freq: 329.63, duration: 2.0 }, // E4
        ];
        
        let currentTime = audioContext.currentTime;
        
        notes.forEach((note, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(note.freq, currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + note.duration);
            
            oscillator.start(currentTime);
            oscillator.stop(currentTime + note.duration);
            
            currentTime += note.duration;
        });
        
        // Lặp lại sau khi kết thúc
        setTimeout(() => {
            if (isPlaying) {
                playHappyBirthdaySong();
            }
        }, currentTime * 1000);
        
    } catch (error) {
        console.log('Cannot create audio context:', error);
        musicBtn.innerHTML = '<i class="fas fa-music"></i><span>Audio not supported</span>';
    }
}

// Khởi tạo carousel cho hình ảnh
function initializeCarousel() {
    const carousel = document.getElementById('carousel');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const indicators = document.querySelectorAll('.indicator');
    
    let currentSlide = 0;
    const totalSlides = carousel.children.length;
    
    // Hàm chuyển slide
    function goToSlide(slideIndex) {
        currentSlide = slideIndex;
        carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        // Cập nhật indicators
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentSlide);
        });
    }
    
    // Event listeners cho nút điều hướng
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            goToSlide(currentSlide);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentSlide = (currentSlide + 1) % totalSlides;
            goToSlide(currentSlide);
        });
    }
    
    // Event listeners cho indicators
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            goToSlide(index);
        });
    });
    
    // Auto-play carousel - tự động chạy ngang
    setInterval(() => {
        currentSlide = (currentSlide + 1) % totalSlides;
        goToSlide(currentSlide);
    }, 3000); // Chuyển slide mỗi 3 giây
    
    // Thêm hiệu ứng hover cho hình ảnh
    const images = document.querySelectorAll('.carousel-image');
    images.forEach(img => {
        img.addEventListener('mouseenter', () => {
            img.style.transform = 'scale(1.05)';
        });
        
        img.addEventListener('mouseleave', () => {
            img.style.transform = 'scale(1)';
        });
        
        // Thêm sự kiện click để mở preview
        img.addEventListener('click', () => {
            const carouselItem = img.closest('.carousel-item');
            const caption = carouselItem.querySelector('.image-caption').textContent;
            const imageSrc = img.getAttribute('src');
            openImageModal(imageSrc, caption);
        });
        
        // Thêm cursor pointer để người dùng biết có thể click
        img.style.cursor = 'pointer';
    });
}

// Biến để lưu trữ danh sách ảnh và ảnh hiện tại
let imageList = [];
let currentImageIndex = 0;

// Khởi tạo danh sách ảnh từ carousel
function initializeImageList() {
    const carouselItems = document.querySelectorAll('.carousel-item');
    imageList = Array.from(carouselItems).map(item => {
        const img = item.querySelector('.carousel-image');
        const caption = item.querySelector('.image-caption');
        return {
            src: img.getAttribute('src'),
            caption: caption.textContent
        };
    });
}

// Hàm mở modal preview ảnh
function openImageModal(imageSrc, caption) {
    // Tìm index của ảnh hiện tại
    currentImageIndex = imageList.findIndex(img => img.src === imageSrc);
    if (currentImageIndex === -1) {
        currentImageIndex = 0;
    }
    
    updateModalImage();
    const modal = document.getElementById('imageModal');
    modal.style.display = 'flex';
}

// Hàm cập nhật ảnh trong modal
function updateModalImage() {
    const modalImage = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalImageCaption');
    const downloadBtn = document.getElementById('downloadBtn');
    const prevBtn = document.getElementById('modalPrevBtn');
    const nextBtn = document.getElementById('modalNextBtn');
    
    const currentImage = imageList[currentImageIndex];
    
    modalImage.src = currentImage.src;
    modalCaption.textContent = currentImage.caption;
    
    // Thiết lập sự kiện download
    downloadBtn.onclick = () => {
        downloadImage(currentImage.src, currentImage.caption);
    };
    
    // Cập nhật trạng thái nút prev/next
    if (prevBtn) {
        prevBtn.style.display = imageList.length > 1 ? 'flex' : 'none';
    }
    if (nextBtn) {
        nextBtn.style.display = imageList.length > 1 ? 'flex' : 'none';
    }
}

// Hàm chuyển đến ảnh tiếp theo
function nextModalImage() {
    currentImageIndex = (currentImageIndex + 1) % imageList.length;
    updateModalImage();
}

// Hàm chuyển đến ảnh trước đó
function prevModalImage() {
    currentImageIndex = (currentImageIndex - 1 + imageList.length) % imageList.length;
    updateModalImage();
}

// Hàm đóng modal
function closeImageModal() {
    const modal = document.getElementById('imageModal');
    modal.style.display = 'none';
}

// Khởi tạo modal preview
function initializeImageModal() {
    const modal = document.getElementById('imageModal');
    const closeBtn = document.querySelector('.modal-close');
    const prevBtn = document.getElementById('modalPrevBtn');
    const nextBtn = document.getElementById('modalNextBtn');
    
    // Khởi tạo danh sách ảnh
    initializeImageList();
    
    // Đóng modal khi click vào nút X
    if (closeBtn) {
        closeBtn.addEventListener('click', closeImageModal);
    }
    
    // Nút previous
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            prevModalImage();
        });
    }
    
    // Nút next
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            nextModalImage();
        });
    }
    
    // Đóng modal khi click bên ngoài
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeImageModal();
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (modal.style.display === 'flex') {
            if (e.key === 'Escape') {
                closeImageModal();
            } else if (e.key === 'ArrowLeft') {
                prevModalImage();
            } else if (e.key === 'ArrowRight') {
                nextModalImage();
            }
        }
    });
}

// Hàm tải xuống ảnh với text được vẽ lên
function downloadImage(imageSrc, caption) {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Cho phép vẽ ảnh từ cùng origin
    
    img.onload = function() {
        // Dùng đúng kích thước gốc của ảnh để giữ chất lượng
        const displayWidth = img.naturalWidth;
        const displayHeight = img.naturalHeight;

        // Tạo canvas với kích thước gốc
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        
        // Tính toán để crop và scale ảnh giống object-fit: cover
        const imgAspect = img.width / img.height;
        const canvasAspect = displayWidth / displayHeight;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imgAspect > canvasAspect) {
            // Ảnh rộng hơn, crop theo chiều ngang
            drawHeight = displayHeight;
            drawWidth = drawHeight * imgAspect;
            drawX = (displayWidth - drawWidth) / 2;
            drawY = 0;
        } else {
            // Ảnh cao hơn, crop theo chiều dọc
            drawWidth = displayWidth;
            drawHeight = drawWidth / imgAspect;
            drawX = 0;
            drawY = (displayHeight - drawHeight) / 2;
        }
        
        // Vẽ ảnh lên canvas với kích thước và vị trí đã tính
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        
        // Font size và padding tỉ lệ theo chiều cao ảnh (giống tỷ lệ trước đây)
        const fontSize = displayHeight * 0.0384; // ~3.84% chiều cao
        const paddingX = displayHeight * 0.04;   // ~4% chiều cao
        const paddingY = displayHeight * 0.04;   // ~4% chiều cao
        
        // Vẽ gradient overlay ở phía dưới (giống như CSS)
        const gradientHeight = displayHeight * 0.25; // 25% chiều cao
        const gradient = ctx.createLinearGradient(0, canvas.height - gradientHeight, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, canvas.height - gradientHeight, canvas.width, gradientHeight);
        
        // Thiết lập font và style cho text
        ctx.font = `600 ${fontSize}px 'Poppins', 'Inter', sans-serif`;
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        
        // Thêm text shadow effect
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = fontSize * 0.1;
        ctx.shadowOffsetX = fontSize * 0.05;
        ctx.shadowOffsetY = fontSize * 0.05;
        
        // Vẽ text ở góc dưới bên trái
        const x = paddingX;
        const y = canvas.height - paddingY;
        
        ctx.fillText(caption, x, y);
        
        // Chuyển canvas thành blob và download
        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const fileName = caption.replace(/\s+/g, '_').toLowerCase() + '.jpg';
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 'image/jpeg', 0.95);
    };
    
    img.onerror = function() {
        // Fallback: download ảnh gốc nếu có lỗi
        const link = document.createElement('a');
        link.href = imageSrc;
        const fileName = caption.replace(/\s+/g, '_').toLowerCase() + '.jpg';
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    img.src = imageSrc;
}

// Khởi tạo các animation cơ bản
function initializeAnimations() {
    // Thêm hiệu ứng typing cho tiêu đề chính
    const mainTitle = document.getElementById('main-title');
    if (mainTitle) {
        setTimeout(() => {
            mainTitle.classList.add('typing');
            autoResizeText();

            window.setTimeout(() => {
                mainTitle.classList.remove('typing');
            }, 1700);
        }, 1000);
    }
    
    // Tạo hiệu ứng floating elements liên tục
    createFloatingElements();
}

// Tạo hiệu ứng confetti
function createConfetti() {
    const confettiContainer = document.getElementById('confetti-container');
    const colors = ['#ff6b9d', '#ffc0cb', '#ffb6c1', '#ff69b4', '#ff1493'];
    
    // Tạo confetti ban đầu
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            createConfettiPiece(confettiContainer, colors);
        }, i * 100);
    }
    
    // Tạo confetti định kỳ
    setInterval(() => {
        createConfettiPiece(confettiContainer, colors);
    }, 2000);
}

function createConfettiPiece(container, colors) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
    confetti.style.animationDelay = Math.random() * 2 + 's';
    
    container.appendChild(confetti);
    
    // Xóa confetti sau khi animation kết thúc
    setTimeout(() => {
        if (confetti.parentNode) {
            confetti.parentNode.removeChild(confetti);
        }
    }, 5000);
}

// Tạo floating elements liên tục
function createFloatingElements() {
    const elementsContainer = document.querySelector('.floating-elements');
    const elements = ['🌸', '🌷', '🍃', '✨', '💫', '🕊️', '💖', '🌼'];
    
    setInterval(() => {
        const element = document.createElement('div');
        element.className = 'floating-item';
        element.textContent = elements[Math.floor(Math.random() * elements.length)];
        element.style.left = Math.random() * 100 + '%';
        element.style.animationDuration = (Math.random() * 5 + 14) + 's';
        
        elementsContainer.appendChild(element);
        
        // Xóa element sau khi animation kết thúc
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 20000);
    }, 4200);
}

// --- Nội dung thư (từng từ) ---
var LETTER_COPY = {
    title: ['✨Mau', 'khỏe', 'lại', 'nhaa✨'],
    lines: [
        ['Tớ', 'biết', 'là', 'thời', 'gian', 'này', 'cậu', 'phải', 'ở', 'nhà', 'nên', 'cũng', 'khá', 'khó', 'chịu', 'và', 'buồn', 'chán.'],
        ['Nhưng', 'rồi', 'sẽ', 'ổn', 'thôi!', 'Cố', 'lên', 'nhaaa', '🌷'],
    ],
    sign: ['ng.sang02'],
};

function letterEscapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function letterSpanWord(w) {
    return '<span class="letter-word">' + letterEscapeHtml(w) + '</span>';
}

function buildLetterWordsDOM() {
    var titleEl = document.getElementById('letterTitleEl');
    var bodyEl = document.getElementById('letterBodyEl');
    var signEl = document.getElementById('letterSignEl');
    if (!titleEl || !bodyEl || !signEl) return;

    titleEl.innerHTML = LETTER_COPY.title.map(letterSpanWord).join('');
    bodyEl.innerHTML = LETTER_COPY.lines
        .map(function (line) {
            return '<p class="letter-line">' + line.map(letterSpanWord).join('') + '</p>';
        })
        .join('');
    signEl.innerHTML = LETTER_COPY.sign.map(letterSpanWord).join('');
}

function letterPrefersReducedMotion() {
    return (
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
}

function resetLetterWordStates() {
    document.querySelectorAll('#letter .letter-word').forEach(function (el) {
        el.classList.remove('is-on');
    });
}

var letterWordAnimGen = 0;

function playLetterWordsAnimated(fromGen) {
    var words = document.querySelectorAll('#letter .letter-word');
    if (letterPrefersReducedMotion()) {
        words.forEach(function (el) {
            el.classList.add('is-on');
        });
        return;
    }
    var delayMs = 56;
    var i = 0;
    function step() {
        if (fromGen !== letterWordAnimGen) return;
        if (i >= words.length) return;
        words[i].classList.add('is-on');
        i += 1;
        if (i < words.length) {
            window.setTimeout(step, delayMs);
        }
    }
    step();
}

// Khởi tạo nút surprise
function initializeSurpriseButton() {
    var scene = document.getElementById('scene');
    var envelope = document.getElementById('envelope');
    var overlay = document.getElementById('overlay');
    var letter = document.getElementById('letter');
    var surpriseSection = scene ? scene.closest('.surprise-section') : null;

    if (!scene || !envelope || !overlay || !letter) {
        return;
    }

    buildLetterWordsDOM();

    function openLetter() {
        scene.classList.add('open');
        document.body.classList.add('letter-open');
        overlay.setAttribute('aria-hidden', 'false');
        if (surpriseSection) {
            const viewportH = window.innerHeight || document.documentElement.clientHeight;
            const letterH = letter.offsetHeight;
            const overflowScroll = Math.max(0, letterH + 56 - viewportH);
            const extraScroll = Math.max(60, overflowScroll);
            surpriseSection.style.setProperty('--letter-extra-scroll', `${extraScroll}px`);
        }
        window.setTimeout(function () {
            const letterRect = letter.getBoundingClientRect();
            const viewportH = window.innerHeight || document.documentElement.clientHeight;
            const targetY = window.scrollY + letterRect.top - Math.max(24, viewportH * 0.12);
            window.scrollTo({
                top: Math.max(0, targetY),
                behavior: 'smooth'
            });
        }, 80);
        resetLetterWordStates();
        var gen = ++letterWordAnimGen;
        window.setTimeout(function () {
            if (gen !== letterWordAnimGen) return;
            playLetterWordsAnimated(gen);
        }, 400);
    }

    function closeLetter() {
        letterWordAnimGen += 1;
        scene.classList.remove('open');
        document.body.classList.remove('letter-open');
        overlay.setAttribute('aria-hidden', 'true');
        if (surpriseSection) {
            surpriseSection.style.removeProperty('--letter-extra-scroll');
        }
        resetLetterWordStates();
    }

    envelope.addEventListener('click', openLetter);
    envelope.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openLetter();
        }
    });

    letter.addEventListener('click', closeLetter);
    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            closeLetter();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && scene.classList.contains('open')) {
            closeLetter();
        }
    });

    // Tạo thêm confetti nhẹ khi mở thư
    envelope.addEventListener('click', () => {
        const confettiContainer = document.getElementById('confetti-container');
        const colors = ['#ff6b9d', '#ffc0cb', '#ffb6c1', '#ff69b4', '#ff1493'];
        for (let i = 0; i < 25; i++) {
            setTimeout(() => {
                createConfettiPiece(confettiContainer, colors);
            }, i * 30);
        }
    });
}

// Giữ hàm cũ để tránh lỗi nếu được gọi ở nơi khác
function createFireworkEffect() {
    return;
}

function createSurpriseConfetti() {
    return;
}
// Console message cho developer
console.log('🌸 Gentle theme loaded successfully!');
console.log('🎵 Music player with Web Audio API');
console.log('✨ Enjoy the animations and effects!');
