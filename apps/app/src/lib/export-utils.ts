export async function copyTextToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (err) {
      // Fallback
    }
  }

  // Fallback for unsupported browsers or contexts
  const textArea = document.createElement("textarea");
  textArea.value = text;
  
  // Prevent scrolling
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    if (!successful) {
      throw new Error('Failed to copy text');
    }
  } finally {
    document.body.removeChild(textArea);
  }
}

export function downloadTextFile(filename: string, content: string): void {
  // Use basename safely to avoid nested folder issues on some browsers
  const safeFilename = filename.includes('/') ? filename.split('/').pop() || 'export.md' : filename;
  
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', safeFilename);
  
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}
