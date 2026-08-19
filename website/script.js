/* ============================================
   Hands-On Computer Vision — Interactive Script
   ============================================ */

// ===== CONFIG =====
const GITHUB_USER = 'your-github-username';
const GITHUB_REPO = 'Hands-On-Computer-Vision';
const GITHUB_BRANCH = 'main';

// ===== NOTEBOOK DATA =====
const notebooks = [
    // 图像处理基础
    {
        title: '数字图像的获取和表示',
        subtitle: '像素操作 · Gamma校正 · 颜色空间',
        emoji: '🖼️',
        tag: '经典',
        tagClass: 'classic',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        duration: '15分钟',
        category: '图像处理基础',
        chapter: 1,
        filePath: '图像处理基础/数字图像的获取和表示/编程实践.ipynb'
    },
    {
        title: '颜色空间的转换',
        subtitle: 'RGB/HSV/Lab空间转换 · 颜色传递',
        emoji: '🎨',
        tag: '经典',
        tagClass: 'classic',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        duration: '18分钟',
        category: '图像处理基础',
        chapter: 2,
        filePath: '图像处理基础/颜色空间的转换/编程实践.ipynb'
    },
    {
        title: '基于直方图统计的处理',
        subtitle: '直方图计算 · 均衡化 · 匹配',
        emoji: '📊',
        tag: '经典',
        tagClass: 'classic',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        duration: '16分钟',
        category: '图像处理基础',
        chapter: 3,
        filePath: '图像处理基础/基于直方图统计的处理/编程实践.ipynb'
    },
    {
        title: '图像滤波',
        subtitle: '高斯滤波 · 双边滤波 · 椒盐噪声',
        emoji: '🌊',
        tag: '经典',
        tagClass: 'classic',
        gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        duration: '20分钟',
        category: '图像处理基础',
        chapter: 4,
        filePath: '图像处理基础/图像滤波/编程实践.ipynb'
    },
    {
        title: '特征提取',
        subtitle: 'Canny边缘检测 · SIFT特征提取与匹配',
        emoji: '🔍',
        tag: '经典',
        tagClass: 'classic',
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        duration: '25分钟',
        category: '图像处理基础',
        chapter: 5,
        filePath: '图像处理基础/特征提取/编程实践.ipynb'
    },
    {
        title: '几何变换',
        subtitle: '相似变换 · 仿射变换 · 单应变换',
        emoji: '📐',
        tag: '几何',
        tagClass: 'geometry',
        gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        duration: '22分钟',
        category: '图像处理基础',
        chapter: 6,
        filePath: '图像处理基础/几何变换/编程实践.ipynb'
    },
    // 最优化算法与立体视觉重建
    {
        title: '图像拼接模型',
        subtitle: '最小二乘 · RANSAC · 全景拼接',
        emoji: '🧩',
        tag: '立体视觉',
        tagClass: 'depth',
        gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        duration: '28分钟',
        category: '最优化算法与立体视觉重建',
        chapter: 7,
        filePath: '最优化算法与立体视觉重建/图像拼接模型/编程实践.ipynb'
    },
    {
        title: '相机参数标定',
        subtitle: '针孔模型 · 张氏标定法 · LM优化',
        emoji: '📷',
        tag: '立体视觉',
        tagClass: 'depth',
        gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        duration: '30分钟',
        category: '最优化算法与立体视觉重建',
        chapter: 8,
        filePath: '最优化算法与立体视觉重建/相机参数标定/编程实践.ipynb'
    },
    {
        title: '立体视觉点云重建',
        subtitle: 'SFM流程 · 本质矩阵 · 三角化',
        emoji: '🌐',
        tag: '立体视觉',
        tagClass: 'depth',
        gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
        duration: '35分钟',
        category: '最优化算法与立体视觉重建',
        chapter: 9,
        filePath: '最优化算法与立体视觉重建/立体视觉点云重建/编程实践.ipynb'
    },
    // EXTRA 传统算法
    {
        title: '卷积',
        subtitle: '图像卷积操作的手写实现与深入理解',
        emoji: '🔀',
        tag: '经典',
        tagClass: 'classic',
        gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
        duration: '20分钟',
        category: 'EXTRA',
        chapter: 'E1',
        filePath: 'EXTRA/卷积/编程实践_补充.ipynb'
    },
    {
        title: '模板匹配',
        subtitle: 'SAD/SSD/NCC 模板匹配算法实现',
        emoji: '🎯',
        tag: '经典',
        tagClass: 'classic',
        gradient: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
        duration: '18分钟',
        category: 'EXTRA',
        chapter: 'E2',
        filePath: 'EXTRA/模板匹配/编程实践_补充.ipynb'
    },
    {
        title: '图像分割',
        subtitle: '阈值分割 · 区域生长 · 图割算法',
        emoji: '✂️',
        tag: '经典',
        tagClass: 'classic',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        duration: '25分钟',
        category: 'EXTRA',
        chapter: 'E3',
        filePath: 'EXTRA/图像分割/编程实践_补充.ipynb'
    },
    {
        title: '光流和运动场',
        subtitle: '稀疏光流 · 稠密光流 · 运动分析',
        emoji: '💨',
        tag: '经典',
        tagClass: 'classic',
        gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
        duration: '22分钟',
        category: 'EXTRA',
        chapter: 'E10',
        filePath: 'EXTRA/光流和运动场/编程实践_补充.ipynb'
    },
    // EXTRA 深度学习
    {
        title: '图像分类',
        subtitle: '词袋模型 · ResNet · 深度学习分类',
        emoji: '🏷️',
        tag: '深度学习',
        tagClass: 'dl',
        gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
        duration: '40分钟',
        category: 'EXTRA',
        chapter: 'E4',
        filePath: 'EXTRA/图像分类/编程实践_补充.ipynb'
    },
    {
        title: '语义分割',
        subtitle: '基于深度学习的像素级语义分割',
        emoji: '🎨',
        tag: '深度学习',
        tagClass: 'dl',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        duration: '45分钟',
        category: 'EXTRA',
        chapter: 'E5',
        filePath: 'EXTRA/语义分割/编程实践_补充.ipynb'
    },
    {
        title: '目标检测',
        subtitle: 'R-CNN · YOLO · SSD 目标检测算法',
        emoji: '🎯',
        tag: '深度学习',
        tagClass: 'dl',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        duration: '50分钟',
        category: 'EXTRA',
        chapter: 'E6',
        filePath: 'EXTRA/目标检测/编程实践_补充.ipynb'
    },
    {
        title: '实例分割',
        subtitle: 'Mask R-CNN 等实例分割算法',
        emoji: '💎',
        tag: '深度学习',
        tagClass: 'dl',
        gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        duration: '48分钟',
        category: 'EXTRA',
        chapter: 'E7',
        filePath: 'EXTRA/实例分割/编程实践_补充.ipynb'
    },
    {
        title: '人体姿态估计',
        subtitle: 'OpenPose · HRNet 姿态估计模型',
        emoji: '🧍',
        tag: '深度学习',
        tagClass: 'dl',
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        duration: '42分钟',
        category: 'EXTRA',
        chapter: 'E8',
        filePath: 'EXTRA/人体姿态估计/编程实践_补充.ipynb'
    },
    {
        title: '动作识别',
        subtitle: '双流网络 · 3D CNN 视频动作识别',
        emoji: '🏃',
        tag: '深度学习',
        tagClass: 'dl',
        gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        duration: '45分钟',
        category: 'EXTRA',
        chapter: 'E9',
        filePath: 'EXTRA/动作识别/编程实践_补充.ipynb'
    }
];

// ===== COLAB HELPERS =====
function getColabUrl(filePath) {
    return `https://colab.research.google.com/github/${GITHUB_USER}/${GITHUB_REPO}/blob/${GITHUB_BRANCH}/${encodeURIComponent(filePath)}`;
}

function openColab(filePath, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    window.open(getColabUrl(filePath), '_blank');
}

function openColabIndex(event) {
    if (event) event.preventDefault();
    const url = `https://colab.research.google.com/github/${GITHUB_USER}/${GITHUB_REPO}/blob/${GITHUB_BRANCH}/`;
    window.open(url, '_blank');
}

// ===== VIEW NOTEBOOK =====
function viewNotebook(filePath, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    const url = `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/blob/${GITHUB_BRANCH}/${encodeURIComponent(filePath)}`;
    window.open(url, '_blank');
}

// ===== COPY LINK =====
function copyLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        showToast('链接已复制到剪贴板');
    }).catch(() => {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('链接已复制到剪贴板');
    });
}

// ===== COPY CODE =====
function copyCode(btn) {
    const codeBlock = btn.closest('.code-block');
    const codeBody = codeBlock.querySelector('.code-block-body');
    const text = codeBody.textContent;
    navigator.clipboard.writeText(text).then(() => {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><polyline points="20 6 9 17 4 12"/></svg>已复制';
        setTimeout(() => { btn.innerHTML = originalHTML; }, 2000);
    });
}

// ===== TOAST NOTIFICATION =====
function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.cssText = `
        position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
        padding: 12px 24px; background: #1D1D1F; color: white;
        border-radius: 10px; font-size: 14px; font-weight: 500;
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        z-index: 300; opacity: 0; transition: opacity 250ms ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => { toast.style.opacity = '1'; });
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 250);
    }, 2000);
}

// ===== RENDER NOTEBOOK CARDS =====
function renderNotebooks(filter = 'all') {
    const track = document.getElementById('carousel-track');
    if (!track) return;

    const filtered = filter === 'all'
        ? notebooks
        : filter === 'basic'
            ? notebooks.filter(n => n.category === '图像处理基础')
            : filter === 'optimization'
                ? notebooks.filter(n => n.category === '最优化算法与立体视觉重建')
                : filter === 'extra'
                    ? notebooks.filter(n => n.category === 'EXTRA')
                    : notebooks;

    track.innerHTML = filtered.map(nb => `
        <div class="notebook-card" data-path="${nb.filePath}">
            <div class="notebook-cover" style="background: ${nb.gradient}">
                <span class="notebook-emoji">${nb.emoji}</span>
                <button class="colab-badge" onclick="openColab('${nb.filePath}', event)" title="在 Colab 打开">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M8 12l3 3 5-5"/>
                    </svg>
                    Colab
                </button>
            </div>
            <div class="notebook-info">
                <h4>${nb.title}</h4>
                <p>${nb.subtitle}</p>
                <div class="notebook-meta">
                    <span class="notebook-tag ${nb.tagClass}">${nb.tag}</span>
                    <span class="notebook-duration">${nb.duration}</span>
                </div>
                <div class="notebook-actions">
                    <button class="action-btn colab-action" onclick="openColab('${nb.filePath}', event)">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M8 12l3 3 5-5"/>
                        </svg>
                        Colab
                    </button>
                    <button class="action-btn view-action" onclick="viewNotebook('${nb.filePath}', event)">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                        </svg>
                        预览
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    return filtered.length;
}

// ===== CAROUSEL =====
let carouselIndex = 0;
let cardsPerPage = 4;

function getCardsPerPage() {
    const viewport = document.querySelector('.carousel-viewport');
    const width = viewport ? viewport.offsetWidth : 900;
    if (window.innerWidth <= 640) return 1;
    if (window.innerWidth <= 1024) return 2;
    return Math.min(4, Math.floor(width / 260));
}

function updateCarousel() {
    const track = document.getElementById('carousel-track');
    if (!track) return;

    const totalCards = track.children.length;
    cardsPerPage = getCardsPerPage();
    const maxIndex = Math.max(0, totalCards - cardsPerPage);

    if (carouselIndex > maxIndex) carouselIndex = maxIndex;

    const cardWidth = track.children[0] ? track.children[0].offsetWidth + 16 : 240;
    track.style.transform = `translateX(-${carouselIndex * cardWidth}px)`;

    const progress = document.getElementById('progress-bar');
    if (progress && maxIndex > 0) {
        progress.style.width = `${((carouselIndex + 1) / (maxIndex + 1)) * 60}px`;
    }
}

function nextSlide() {
    const track = document.getElementById('carousel-track');
    if (!track) return;
    const totalCards = track.children.length;
    const maxIndex = Math.max(0, totalCards - cardsPerPage);
    carouselIndex = carouselIndex >= maxIndex ? 0 : carouselIndex + 1;
    updateCarousel();
}

function prevSlide() {
    const track = document.getElementById('carousel-track');
    if (!track) return;
    const totalCards = track.children.length;
    const maxIndex = Math.max(0, totalCards - cardsPerPage);
    carouselIndex = carouselIndex <= 0 ? maxIndex : carouselIndex - 1;
    updateCarousel();
}

// ===== SIDEBAR NAVIGATION =====
function initializeNavigation() {
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const href = item.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }

            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            const chapter = item.dataset.chapter;
            const extra = item.dataset.extra;

            let filter = 'all';
            if (chapter) filter = chapter <= 6 ? 'basic' : 'optimization';
            else if (extra) filter = 'extra';

            if (filter !== 'all') {
                renderNotebooks(filter);
                carouselIndex = 0;
                updateCarousel();
            }

            // Close sidebar on mobile
            if (window.innerWidth <= 1024) {
                const sidebar = document.getElementById('sidebar');
                const overlay = document.getElementById('mobile-overlay');
                if (sidebar) sidebar.classList.remove('open');
                if (overlay) overlay.classList.remove('show');
            }
        });
    });
}

// ===== TOC SCROLL SPY =====
function initializeScrollSpy() {
    const tocLinks = document.querySelectorAll('.toc-link');
    const sections = [];

    // Collect all sections that have corresponding TOC links
    tocLinks.forEach(link => {
        const targetId = link.dataset.target;
        if (targetId) {
            const section = document.getElementById(targetId);
            if (section) {
                sections.push({ id: targetId, element: section, link: link });
            }
        }
    });

    if (sections.length === 0) return;

    function onScroll() {
        const scrollPos = window.scrollY + 120; // offset for better UX
        let currentId = sections[0].id;

        for (const section of sections) {
            if (section.element.offsetTop <= scrollPos) {
                currentId = section.id;
            }
        }

        // Update TOC active state
        tocLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.target === currentId) {
                link.classList.add('active');
            }
        });

        // Update sidebar active state
        const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
        navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href === `#${currentId}`) {
                navItems.forEach(n => n.classList.remove('active'));
                item.classList.add('active');
            }
        });
    }

    // Throttle scroll event
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                onScroll();
                ticking = false;
            });
            ticking = true;
        }
    });

    // Initialize on load
    onScroll();
}

// ===== TOC CLICK HANDLING =====
function initializeTocClicks() {
    const tocLinks = document.querySelectorAll('.toc-link');
    tocLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.dataset.target;
            if (targetId) {
                e.preventDefault();
                const target = document.getElementById(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });
}

// ===== TOC TOGGLE =====
function toggleToc() {
    const toc = document.getElementById('toc-sidebar');
    if (toc) {
        toc.classList.toggle('collapsed');
    }
}

// ===== SIDEBAR TOGGLE (Mobile) =====
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    let overlay = document.getElementById('mobile-overlay');

    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'mobile-overlay';
        overlay.className = 'mobile-overlay';
        overlay.addEventListener('click', toggleSidebar);
        document.body.appendChild(overlay);
    }

    if (sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
    } else {
        sidebar.classList.add('open');
        overlay.classList.add('show');
    }
}

// ===== LANGUAGE SWITCH =====
function initializeLanguageSwitch() {
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            showToast(`语言已切换为 ${btn.dataset.lang === 'zh' ? '中文' : 'English'}`);
        });
    });
}

// ===== KEYBOARD NAVIGATION =====
function initializeKeyboard() {
    document.addEventListener('keydown', (e) => {
        // Don't trigger when typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (e.key === 'ArrowRight') nextSlide();
        else if (e.key === 'ArrowLeft') prevSlide();
    });
}

// ===== TOUCH SUPPORT =====
function initializeTouch() {
    const viewport = document.querySelector('.carousel-viewport');
    if (!viewport) return;

    let startX = 0;
    let endX = 0;

    viewport.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        const diff = startX - endX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) nextSlide();
            else prevSlide();
        }
    });
}

// ===== AUTO-PLAY =====
let autoPlayInterval;

function startAutoPlay() {
    autoPlayInterval = setInterval(() => {
        nextSlide();
    }, 5000);
}

function stopAutoPlay() {
    clearInterval(autoPlayInterval);
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    // Render notebooks
    renderNotebooks('all');

    // Initialize navigation
    initializeNavigation();
    initializeTocClicks();
    initializeScrollSpy();
    initializeLanguageSwitch();
    initializeKeyboard();
    initializeTouch();

    // Update carousel
    updateCarousel();

    // Auto-play management
    const viewport = document.querySelector('.carousel-viewport');
    if (viewport) {
        viewport.addEventListener('mouseenter', stopAutoPlay);
        viewport.addEventListener('mouseleave', startAutoPlay);
    }
    startAutoPlay();

    // Window resize
    window.addEventListener('resize', () => {
        cardsPerPage = getCardsPerPage();
        updateCarousel();
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});
