import { useCallback, useState } from 'react'

/**
 * 共用图片灯箱：毛玻璃背板全屏预览，点背景/关闭按钮关闭。
 */
export default function ImageLightbox({ src, alt, onClose }) {
  return (
    <div
      className="image-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="图片预览"
      onClick={onClose}
    >
      <button
        className="image-lightbox-close"
        type="button"
        aria-label="关闭图片预览"
        onClick={onClose}
      >
        ×
      </button>
      <div className="image-lightbox-scroll">
        <img src={src} alt={alt} onClick={(event) => event.stopPropagation()} />
      </div>
    </div>
  )
}

/**
 * 图片预览状态管理：封装灯箱的打开与关闭。
 * - openSrc：直接传 src 打开灯箱
 * - close：关闭灯箱
 */
export function useImagePreview() {
  const [imagePreview, setImagePreview] = useState(null)

  const close = useCallback(() => {
    setImagePreview(null)
  }, [])

  const openSrc = useCallback((src, alt) => {
    setImagePreview({ src, alt })
  }, [])

  return { imagePreview, openSrc, close }
}
