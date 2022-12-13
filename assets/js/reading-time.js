(() => {
  const article = document.querySelector("article.h-entry");
  if (article) {
    const text = article.textContent;
    // //英文
    // const wordMatchRegExp = /[^\s]+/g;
    // const words = text.matchAll(wordMatchRegExp);
    // // matchAll returns an iterator, convert to array to get word count
    // const wordCount = [...words].length;
    // const readingTime = Math.ceil(wordCount / 200);

    // 中文
    const blankMatchRegExp = /[\s]+/g;
    const charCount = text.replace(blankMatchRegExp, '').length;
    const readingTime = Math.floor(charCount / 500);

    const badge = document.createElement("p");
    // Use the same styling as the publish information in an article's header
    badge.classList.add("post-meta");
    badge.textContent = `⏱️ 大约需要 ${readingTime} 分钟读完`;

    // Support for API reference docs
    const heading = article.querySelector("h1");
    // Support for article docs with date
    const date = article.querySelector("time")?.parentNode;

    (date ?? heading).insertAdjacentElement("afterend", badge);
  }
})();