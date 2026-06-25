import { useState, useEffect, useRef } from 'react'
import { 
  Shuffle, 
  Heart, 
  Share2, 
  Image, 
  Info, 
  Bookmark, 
  X, 
  Check, 
  Copy, 
  Download, 
  BookOpen, 
  Trash2,
  ExternalLink,
  Sun,
  Moon,
  Coffee
} from 'lucide-react'
import poetryData from './poetry.json'
import './App.css'
import html2canvas from 'html2canvas'

function App() {
  // --- State Variables ---
  const [currentIndex, setCurrentIndex] = useState(0)
  const [bookmarkedIds, setBookmarkedIds] = useState([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [aboutModalOpen, setAboutModalOpen] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [theme, setTheme] = useState('light')
  const [toastMessage, setToastMessage] = useState(null)
  const [toastExit, setToastExit] = useState(false)
  const [animateKey, setAnimateKey] = useState(0)
  
  // --- Export Image Settings ---
  const [exportRatio, setExportRatio] = useState('square') // 'square' | 'story' | 'post'
  const [exportBg, setExportBg] = useState(0) // index in backgroundPresets
  const [exportFontSize, setExportFontSize] = useState(5.6) // in cqw percentage representation
  const [showPoet, setShowPoet] = useState(true)
  const [showBorder, setShowBorder] = useState(true)
  const [showQuotes, setShowQuotes] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  const exportAreaRef = useRef(null)

  const getExportWidth = () => {
    if (exportRatio === 'square') return 450;
    if (exportRatio === 'story') return 320;
    if (exportRatio === 'post') return 500;
    return 450;
  };

  // --- Background presets for image export ---
  const backgroundPresets = [
    { name: 'نيشنل رات', class: 'export-bg-gradient-1', light: false },
    { name: 'ڪاري رات', class: 'export-bg-gradient-2', light: false },
    { name: 'بهار جو باغ', class: 'export-bg-gradient-3', light: true },
    { name: 'گلابي شام', class: 'export-bg-gradient-4', light: false },
    { name: 'آسماني صبح', class: 'export-bg-gradient-5', light: true },
    { name: 'سوني ڪرڻا', class: 'export-bg-gradient-6', light: true },
    { name: 'گهرائي', class: 'export-bg-gradient-7', light: false },
    { name: 'سادي اونداهي', class: 'export-bg-gradient-8', light: false },
    { name: 'سادي روشني', class: 'export-bg-gradient-9', light: true },
  ]

  // --- Load Initial State from LocalStorage ---
  useEffect(() => {
    // Load theme
    const savedTheme = localStorage.getItem('bukhari_theme') || 'light'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)

    // Load bookmarks
    const savedBookmarks = localStorage.getItem('bukhari_bookmarks')
    if (savedBookmarks) {
      try {
        setBookmarkedIds(JSON.parse(savedBookmarks))
      } catch (e) {
        console.error('Error loading bookmarks', e)
      }
    }

    // Pick a random couplet on mount
    if (poetryData && poetryData.length > 0) {
      const randomIndex = Math.floor(Math.random() * poetryData.length)
      setCurrentIndex(randomIndex)
    }
  }, [])

  // --- Theme Handler ---
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    localStorage.setItem('bukhari_theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  // --- Bookmark Handlers ---
  const toggleBookmark = (id) => {
    let updated
    if (bookmarkedIds.includes(id)) {
      updated = bookmarkedIds.filter(bId => bId !== id)
      showToast('پسنديدگي مان ختم ڪيو ويو!')
    } else {
      updated = [...bookmarkedIds, id]
      showToast('پسنديده لسٽ ۾ شامل ڪيو ويو!')
    }
    setBookmarkedIds(updated)
    localStorage.setItem('bukhari_bookmarks', JSON.stringify(updated))
  }

  const deleteBookmark = (e, id) => {
    e.stopPropagation() // Prevent loading the couplet
    const updated = bookmarkedIds.filter(bId => bId !== id)
    setBookmarkedIds(updated)
    localStorage.setItem('bukhari_bookmarks', JSON.stringify(updated))
    showToast('پسنديدگي مان ختم ڪيو ويو!')
  }

  const loadCoupletById = (id) => {
    const idx = poetryData.findIndex(item => item.id === id)
    if (idx !== -1) {
      setCurrentIndex(idx)
      setAnimateKey(prev => prev + 1)
      setDrawerOpen(false)
    }
  }

  // --- Navigation Handlers ---
  const handleRandomize = () => {
    if (!poetryData || poetryData.length <= 1) return
    
    let nextIndex
    // Make sure we get a different couplet than current
    do {
      nextIndex = Math.floor(Math.random() * poetryData.length)
    } while (nextIndex === currentIndex)

    setCurrentIndex(nextIndex)
    setAnimateKey(prev => prev + 1)
  }

  // --- Copy & Share Handlers ---
  const showToast = (message) => {
    setToastMessage(message)
    setToastExit(false)
    
    // Auto-hide after 3 seconds
    const timer = setTimeout(() => {
      setToastExit(true)
      const closeTimer = setTimeout(() => {
        setToastMessage(null)
      }, 300)
      return () => clearTimeout(closeTimer)
    }, 2500)

    return () => clearTimeout(timer)
  }

  const getShareText = (stanza) => {
    return `${stanza.lines.join('\n')}\n\n— استاد بخاري`
  }

  const handleCopyText = (stanza) => {
    const text = getShareText(stanza)
    navigator.clipboard.writeText(text)
      .then(() => {
        showToast('شاعري ڪاپي ڪئي وئي!')
      })
      .catch(() => {
        showToast('ڪاپي ڪرڻ ۾ غلطي آئي.')
      })
  }

  const handleShareLink = (stanza) => {
    const text = getShareText(stanza)
    
    if (navigator.share) {
      navigator.share({
        title: 'استاد بخاريءَ جا چوسٽا',
        text: text,
        url: window.location.href
      })
      .then(() => showToast('شيئر ڪيو ويو!'))
      .catch((err) => {
        if (err.name !== 'AbortError') {
          handleCopyText(stanza)
        }
      })
    } else {
      handleCopyText(stanza)
    }
  }

  // --- Image Export Handler ---
  const handleExportImage = () => {
    document.fonts.ready.then(() => {
      setIsExporting(true)
      const element = exportAreaRef.current
      if (!element) {
        setIsExporting(false)
        return
      }

      // Small delay to ensure render is updated in the browser
      setTimeout(() => {
        html2canvas(element, {
          useCORS: true,
          allowTaint: true,
          scale: 3, // High definition scale (3x)
          backgroundColor: null,
          logging: false
        }).then(canvas => {
          const link = document.createElement('a')
          link.download = `ustad-bukhari-couplet-${poetryData[currentIndex].id}.png`
          link.href = canvas.toDataURL('image/png')
          link.click()
          setIsExporting(false)
          setExportModalOpen(false)
          showToast('تصوير ڊائون لوڊ ٿي وئي!')
        }).catch(err => {
          console.error('Export error:', err)
          setIsExporting(false)
          showToast('تصوير ٺاهڻ ۾ مسئلو آيو.')
        })
      }, 500)
    })
  }

  // --- Safe Check of Data ---
  if (!poetryData || poetryData.length === 0) {
    return (
      <div className="empty-state">
        <p>شاعريءَ جو ڊيٽا لوڊ نه ٿي سگهيو.</p>
      </div>
    )
  }

  const currentStanza = poetryData[currentIndex]
  const isBookmarked = bookmarkedIds.includes(currentStanza.id)

  return (
    <>
      {/* Background Decorative Glow */}
      <div className="bg-glow-container" aria-hidden="true">
        <div className="bg-glow-1"></div>
        <div className="bg-glow-2"></div>
      </div>

      {/* Header */}
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-icon" aria-hidden="true">
            <BookOpen size={24} />
          </div>
          <h1 className="app-title">استاد بخاريءَ جا چوسٽا</h1>
        </div>

        <div className="header-controls">
          {/* Theme Picker */}
          <div className="theme-picker" role="radiogroup" aria-label="Theme Selection">
            <button 
              className={`theme-opt ${theme === 'light' ? 'active' : ''}`}
              onClick={() => handleThemeChange('light')}
              role="radio"
              aria-checked={theme === 'light'}
              title="سادي روشني"
            >
              <Sun size={15} style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
              روشن
            </button>
            <button 
              className={`theme-opt ${theme === 'sepia' ? 'active' : ''}`}
              onClick={() => handleThemeChange('sepia')}
              role="radio"
              aria-checked={theme === 'sepia'}
              title="خاڪي رنگ"
            >
              <Coffee size={15} style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
              خاڪي
            </button>
            <button 
              className={`theme-opt ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => handleThemeChange('dark')}
              role="radio"
              aria-checked={theme === 'dark'}
              title="اونداهي رنگ"
            >
              <Moon size={15} style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
              تاريڪ
            </button>
          </div>

          {/* Bookmarks Toggle Button */}
          <button 
            className={`btn-icon ${drawerOpen ? 'active' : ''}`}
            onClick={() => setDrawerOpen(true)}
            aria-label="Bookmarks list"
            title="منهنجا پسنديده"
            id="bookmarks-toggle-btn"
          >
            <Bookmark size={20} />
            {bookmarkedIds.length > 0 && (
              <span className="badge" aria-label={`${bookmarkedIds.length} bookmarks`}>
                {bookmarkedIds.length}
              </span>
            )}
          </button>

          {/* Info Button */}
          <button 
            className="btn-icon"
            onClick={() => setAboutModalOpen(true)}
            aria-label="About the poet"
            title="شاعر بابت ڄاڻ"
            id="about-toggle-btn"
          >
            <Info size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="app-main">
        <div className="couplet-container">
          {/* Poetry Couplet Card */}
          <article 
            className="couplet-card animate-lines" 
            key={animateKey}
            aria-label={`Couplet card ${currentStanza.id}`}
          >
            <div className="couplet-number">بند: {currentStanza.id}</div>
            
            {/* Elegant corners */}
            <div className="card-corner corner-tr" aria-hidden="true"></div>
            <div className="card-corner corner-tl" aria-hidden="true"></div>
            <div className="card-corner corner-br" aria-hidden="true"></div>
            <div className="card-corner corner-bl" aria-hidden="true"></div>

            <div className="poetry-lines">
              <p className="poetry-line">{currentStanza.lines[0]}</p>
              <p className="poetry-line">{currentStanza.lines[1]}</p>
              <p className="poetry-line">{currentStanza.lines[2]}</p>
              <p className="poetry-line">{currentStanza.lines[3]}</p>
            </div>

            <footer className="poet-attribution">
              — استاد بخاري
            </footer>
          </article>

          {/* Action Buttons */}
          <section className="action-controls" aria-label="Couplet controls">
            <button 
              className={`btn-action-round ${isBookmarked ? 'fav-active' : ''}`}
              onClick={() => toggleBookmark(currentStanza.id)}
              aria-label={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
              title={isBookmarked ? "پسنديده مان خارج ڪريو" : "پسنديده ۾ شامل ڪريو"}
              id="bookmark-btn"
            >
              <Heart size={20} fill={isBookmarked ? "currentColor" : "none"} />
            </button>

            <button 
              className="btn-action-round"
              onClick={() => handleCopyText(currentStanza)}
              aria-label="Copy poetry to clipboard"
              title="ڪاپي ڪريو"
              id="copy-btn"
            >
              <Copy size={20} />
            </button>

            <button 
              className="btn-action-round btn-shuffle"
              onClick={handleRandomize}
              id="next-couplet-btn"
              title="ٻيو شعر ونڊيو"
              aria-label="Next couplet"
            >
              <Shuffle size={24} />
            </button>

            <button 
              className="btn-action-round"
              onClick={() => handleShareLink(currentStanza)}
              aria-label="Share poetry link"
              title="شيئر ڪريو"
              id="share-btn"
            >
              <Share2 size={20} />
            </button>

            <button 
              className="btn-action-round"
              onClick={() => setExportModalOpen(true)}
              aria-label="Export couplet as image"
              title="تصوير ڊائون لوڊ"
              id="export-img-btn"
            >
              <Image size={20} />
            </button>
          </section>
        </div>
      </main>

      {/* Footer */}
      {/* <footer className="app-footer">
        <p>
          سرتيون © {new Date().getFullYear()} — استاد بخاريءَ جي چوسٽن جو مجموعو | سنڌي ٻوليءَ جو فروغ
        </p>
      </footer> */}

      {/* Bookmark Sidebar Drawer */}
      {drawerOpen && (
        <div 
          className="drawer-overlay" 
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}
      <section 
        className={`bookmark-drawer ${drawerOpen ? 'open' : ''}`}
        aria-label="Bookmarked couplets"
        aria-hidden={!drawerOpen}
      >
        <div className="drawer-header">
          <h2 className="drawer-title">
            <Heart size={20} fill="currentColor" style={{ color: 'var(--accent)' }} />
            پسنديده شاعري
          </h2>
          <button 
            className="modal-close"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close bookmarks list"
          >
            <X size={20} />
          </button>
        </div>
        <div className="drawer-body">
          {bookmarkedIds.length === 0 ? (
            <div className="empty-state">
              <Heart size={40} strokeWidth={1} style={{ opacity: 0.5 }} />
              <p className="empty-state-title">لسٽ خالي آهي</p>
              <p style={{ fontSize: '0.85rem' }}>پنهنجي پسنديده شاعريءَ کي محفوظ ڪرڻ لاءِ دل جي نشان تي ڪلڪ ڪريو.</p>
            </div>
          ) : (
            bookmarkedIds.map(id => {
              const stanza = poetryData.find(item => item.id === id)
              if (!stanza) return null
              return (
                <div 
                  key={id}
                  className="bookmark-item"
                  onClick={() => loadCoupletById(id)}
                >
                  <p className="bookmark-item-text">{stanza.lines[0]} ... {stanza.lines[1]}</p>
                  <div className="bookmark-item-meta">
                    <span>بند: {stanza.id}</span>
                    <button 
                      className="btn-delete-bookmark"
                      onClick={(e) => deleteBookmark(e, id)}
                      aria-label="Delete bookmark"
                      title="خارج ڪريو"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </section>

      {/* About Modal */}
      {aboutModalOpen && (
        <div className="modal-overlay" onClick={() => setAboutModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h2 className="modal-title">
                <Info size={22} style={{ color: 'var(--accent)' }} />
                استاد بخاريءَ بابت
              </h2>
              <button 
                className="modal-close" 
                onClick={() => setAboutModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </header>
            <div className="modal-body">
              <article className="about-content">
                <h3 className="about-intro">استاد بخاري: سنڌي ٻوليءَ جو عظيم عوامي شاعر</h3>
                <p className="about-bio">
                  استاد بخاري (احمد شاهه) سنڌ جو هڪ عظيم انقلابي، قومپرست ۽ رومانوي شاعر هو. سندس ولادت 16 جنوري 1930ع تي ضلعي دادو جي ڳوٺ غلام چنڊ ۾ ٿي. هن سنڌي شاعريءَ کي نوان رنگ ۽ نوان احساس ڏنا.
                </p>
                <p className="about-bio">
                  سندس شاعريءَ ۾ سنڌ، سنڌي تهذيب، قومي بقا، پيار ۽ انساني حقن جا نعرا تمام اوچي آواز سان ملن ٿا. استاد بخاريءَ جي شاعري هر طبقي جي ماڻهن ۾ تمام گهڻي مقبول آهي، چاهي اهي سگهڙ هجن يا پڙهيل لکيل اديب. هو 9 آڪٽوبر 1992ع تي ڪراچي ۾ وفات ڪري ويو، پر سندس شاعري اڄ به هر سنڌي جي دلين ۾ زنده آهي.
                </p>

             

                <p className="about-bio" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  هي ويب ايپليڪيشن سنڌ جي هن مهان اديب کي ڀيٽا پيش ڪرڻ لاءِ ٺاهي وئي آهي، جيئن سندس خوبصورت پيغام کي جديد ٽيڪنالاجي ذريعي نوجوان نسل تائين پهچايو وڃي.
                </p>
              </article>
            </div>
          </div>
        </div>
      )}

      {/* Export Image Modal */}
      {exportModalOpen && (
        <div className="modal-overlay" onClick={() => setExportModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px' }}>
            <header className="modal-header">
              <h2 className="modal-title">
                <Image size={22} style={{ color: 'var(--accent)' }} />
                سوشل ميڊيا لاءِ تصوير ٺاهيو
              </h2>
              <button 
                className="modal-close" 
                onClick={() => setExportModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </header>
            <div className="modal-body">
              <div className="export-layout">
                {/* Image Preview Window */}
                <div className="export-preview-container">
                  <div className="export-preview-wrapper">
                    {/* The off-screen elements that html2canvas will capture */}
                    <div 
                      ref={exportAreaRef}
                      className={`export-render-canvas ${backgroundPresets[exportBg].class} ratio-${exportRatio}`}
                    >
                      {showBorder ? (
                        <div className={`export-frame-border ${backgroundPresets[exportBg].light ? 'light-theme' : ''}`}>
                          {showQuotes && <div className={`quote-decor start`}>”</div>}
                          <div 
                            className="export-lines animate-lines" 
                            style={{ 
                              fontSize: `${(getExportWidth() * exportFontSize) / 100}px`,
                              color: backgroundPresets[exportBg].light ? '#1e1c19' : '#ffffff' 
                            }}
                          >
                            <p className="poetry-line">{currentStanza.lines[0]}</p>
                            <p className="poetry-line">{currentStanza.lines[1]}</p>
                            <p className="poetry-line">{currentStanza.lines[2]}</p>
                            <p className="poetry-line">{currentStanza.lines[3]}</p>
                          </div>
                          {showQuotes && <div className={`quote-decor end`}>“</div>}
                          
                          {showPoet && (
                            <div 
                              className="poet-attribution"
                              style={{ 
                                color: backgroundPresets[exportBg].light ? '#8b263e' : '#dcae61',
                                marginTop: '1.5rem',
                                fontSize: '1.25rem' 
                              }}
                            >
                              — استاد بخاري
                            </div>
                          )}

                          <div className="watermark" style={{ color: backgroundPresets[exportBg].light ? '#6e645e' : '#9aa1b0' }}>
                            استاد بخاريءَ جا چوسٽا
                          </div>
                        </div>
                      ) : (
                        <>
                          {showQuotes && <div className={`quote-decor start`}>”</div>}
                          <div 
                            className="export-lines animate-lines" 
                            style={{ 
                              fontSize: `${(getExportWidth() * exportFontSize) / 100}px`,
                              color: backgroundPresets[exportBg].light ? '#1e1c19' : '#ffffff' 
                            }}
                          >
                            <p className="poetry-line">{currentStanza.lines[0]}</p>
                            <p className="poetry-line">{currentStanza.lines[1]}</p>
                            <p className="poetry-line">{currentStanza.lines[2]}</p>
                            <p className="poetry-line">{currentStanza.lines[3]}</p>
                          </div>
                          {showQuotes && <div className={`quote-decor end`}>“</div>}
                          
                          {showPoet && (
                            <div 
                              className="poet-attribution"
                              style={{ 
                                color: backgroundPresets[exportBg].light ? '#8b263e' : '#dcae61',
                                marginTop: '1.5rem',
                                fontSize: '1.25rem' 
                              }}
                            >
                              — استاد بخاري
                            </div>
                          )}

                          <div className="watermark" style={{ color: backgroundPresets[exportBg].light ? '#6e645e' : '#9aa1b0' }}>
                            استاد بخاريءَ جا چوسٽا
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Configuration Panel */}
                <div className="export-settings">
                  {/* Aspect Ratio */}
                  <div className="setting-group">
                    <label className="setting-label">تصوير جي سائيز (فارميٽ):</label>
                    <div className="ratio-options">
                      <button 
                        className={`ratio-btn ${exportRatio === 'square' ? 'active' : ''}`}
                        onClick={() => {
                          setExportRatio('square')
                          setExportFontSize(5.6)
                        }}
                      >
                        1:1 (انسٽاگرام پوسٽ)
                      </button>
                      <button 
                        className={`ratio-btn ${exportRatio === 'story' ? 'active' : ''}`}
                        onClick={() => {
                          setExportRatio('story')
                          setExportFontSize(6.0)
                        }}
                      >
                        9:16 (اسٽوري)
                      </button>
                      <button 
                        className={`ratio-btn ${exportRatio === 'post' ? 'active' : ''}`}
                        onClick={() => {
                          setExportRatio('post')
                          setExportFontSize(5.2)
                        }}
                      >
                        16:9 (فيس بوڪ / ايڪس)
                      </button>
                    </div>
                  </div>

                  {/* Background Presets */}
                  <div className="setting-group">
                    <label className="setting-label">پس منظر جو رنگ:</label>
                    <div className="bg-presets">
                      {backgroundPresets.map((bg, idx) => (
                        <button
                          key={idx}
                          className={`bg-preset-btn ${bg.class} ${exportBg === idx ? 'active' : ''}`}
                          onClick={() => setExportBg(idx)}
                          title={bg.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Text Font Size Slider */}
                  <div className="setting-group">
                    <div className="toggle-row">
                      <label className="setting-label">اکرن جي سائيز:</label>
                      <span style={{ fontSize: '0.85rem', direction: 'ltr' }}>{exportFontSize}%</span>
                    </div>
                    <input 
                      type="range"
                      min="4.0"
                      max="8.0"
                      step="0.1"
                      value={exportFontSize}
                      onChange={(e) => setExportFontSize(parseFloat(e.target.value))}
                      className="slider-input"
                    />
                  </div>

                  {/* Toggle Options */}
                  <div className="setting-group">
                    <label className="setting-label">اضافي سيٽنگون:</label>
                    
                    <div className="toggle-row" style={{ marginTop: '0.5rem' }}>
                      <span>شاعر جو نالو ڏيکاريو</span>
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={showPoet} 
                          onChange={(e) => setShowPoet(e.target.checked)} 
                        />
                        <span className="slider-toggle"></span>
                      </label>
                    </div>

                    <div className="toggle-row" style={{ marginTop: '0.5rem' }}>
                      <span>خوبصورت فريم بارڊر</span>
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={showBorder} 
                          onChange={(e) => setShowBorder(e.target.checked)} 
                        />
                        <span className="slider-toggle"></span>
                      </label>
                    </div>

                    <div className="toggle-row" style={{ marginTop: '0.5rem' }}>
                      <span>شروعاتي ۽ آخري نشان (Quotes)</span>
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={showQuotes} 
                          onChange={(e) => setShowQuotes(e.target.checked)} 
                        />
                        <span className="slider-toggle"></span>
                      </label>
                    </div>
                  </div>

                  {/* Action Download */}
                  <button 
                    className="btn-primary" 
                    onClick={handleExportImage}
                    disabled={isExporting}
                    style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
                    id="download-png-btn"
                  >
                    <Download size={20} />
                    {isExporting ? 'تصوير تيار ٿي رهي آهي...' : 'تصوير گيلري ۾ محفوظ ڪريو'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Toast Notification */}
      {toastMessage && (
        <div className={`share-toast ${toastExit ? 'toast-exit' : ''}`} role="status">
          <Check size={18} />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  )
}

export default App
