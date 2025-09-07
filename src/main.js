/// xd 插件開發文檔可參閱
/// https://developer.adobe.com/xd/uxp/develop/tutorials/quick-start/

const assets = require('assets')
const clipboard = require('clipboard')

function copyUnoAssetsColors() {
  /** @type {AssetsColor[]} */
  const allAssetsColors = assets.colors.get()

  if (!allAssetsColors.length) {
    showAlert('assets 沒有任一顏色，嘗試添加顏色以嘗試複製功能')
    return
  }

  const copyTextList = []

  allAssetsColors.forEach(({
    name,
    color,
    gradientType,
    colorStops,
  }) => {
    const [, colorName] = name?.match(/^([A-z]+\d+).*$/) || []
    if (!colorName) return

    if (color) {
      copyTextList.push(`${colorName}: ${toOldUnoColorValue(color)}, // ${name}`)
    } else if (gradientType) {
      colorStops.forEach((f, i) => {
        const { color } = f
        copyTextList.push(`${colorName}_${i + 1}: ${toOldUnoColorValue(color)}, // ${name}`)
      })
    }
  })

  if (!copyTextList.length) {
    showAlert('未匹配到任何可以複製的顏色！')
    return
  }

  const colorText = sortColorNameList(copyTextList).join('\n  ')

  clipboard.copyText(`{
  ${colorText}
}`)

  showAlert('顏色已成功複製到剪貼簿！')
}

function toOldUnoColorValue (color) {
  const hexColor = color.toHex(true)
  if (color.a == null || color.a === 255) return `'${hexColor}'`
  return `rgba('${hexColor}', ${alphaToPercentage(color.a) / 100})`
}

function showAlert(message) {
  const dialog = document.createElement('dialog')
  dialog.innerHTML = `
    <form method="dialog" style="width: 400px; padding: 20px">
      <h1>通知</h1>
      <p>${message}</p>
      <footer>
          <button id="alert-submit" uxp-variant="cta" type="submit">確定</button>
      </footer>
    </form>
  `
  document.body.appendChild(dialog)
  dialog.showModal().then(() => dialog.remove())
}

function alphaToPercentage(alpha) {
  return Math.round((alpha / 255) * 100)
}

function sortColorNameList (colorNameList, {
  transformElement,
} = {}) {
  // 提取編號部分，框出前面的 "xxx號色"
  const regex = /^([A-z]+)(\d+)/

  return colorNameList.sort((a, b) => {
    const _a = transformElement ? transformElement(a) : a
    const _b = transformElement ? transformElement(b) : b
    const matchA = _a.match(regex)
    const matchB = _b.match(regex)

    if (!matchA || !matchB) {
      return _a.localeCompare(_b)
    }

    const [_, prefixA, numA] = matchA // 分為前綴與數字
    const [__, prefixB, numB] = matchB

    if (prefixA !== prefixB) {
      // 比較字母前綴
      return prefixA.localeCompare(prefixB)
    }

    // 比較數字部分
    return parseInt(numA, 10) - parseInt(numB, 10)
  })
}

module.exports = {
  commands: {
    copyUnoAssetsColors,
  },
}
