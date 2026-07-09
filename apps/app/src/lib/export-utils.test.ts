import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { copyTextToClipboard, downloadTextFile } from './export-utils';

type TestElement = {
  tagName: string;
  value: string;
  href: string;
  download: string;
  style: Record<string, string>;
  setAttribute: (name: string, value: string) => void;
  focus: () => void;
  select: () => void;
  click: () => void;
};

function createTestElement(tagName: string): TestElement {
  return {
    tagName: tagName.toUpperCase(),
    value: "",
    href: "",
    download: "",
    style: {},
    setAttribute(name, value) {
      if (name === "download") this.download = value;
    },
    focus: vi.fn(),
    select: vi.fn(),
    click: vi.fn(),
  };
}

beforeAll(() => {
  const body = {
    appendChild: vi.fn((element: TestElement) => element),
    removeChild: vi.fn((element: TestElement) => element),
  };
  const documentMock = {
    body,
    createElement: vi.fn((tagName: string) => createTestElement(tagName)),
    execCommand: vi.fn(() => true),
  };
  Object.defineProperty(globalThis, "window", {
    value: { isSecureContext: true },
    configurable: true,
  });
  Object.defineProperty(globalThis, "document", {
    value: documentMock,
    configurable: true,
  });
  Object.defineProperty(globalThis, "navigator", {
    value: {},
    configurable: true,
  });
});

describe('export-utils', () => {
  describe('copyTextToClipboard', () => {
    let originalClipboard: unknown;

    beforeEach(() => {
      originalClipboard = navigator.clipboard;
      // Mock window.isSecureContext
      Object.defineProperty(window, 'isSecureContext', { value: true, writable: true });
    });

    afterEach(() => {
      Object.defineProperty(navigator, 'clipboard', { value: originalClipboard, writable: true });
      vi.restoreAllMocks();
    });

    it('should use navigator.clipboard if available', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        writable: true,
      });

      await copyTextToClipboard('test content');
      expect(writeTextMock).toHaveBeenCalledWith('test content');
    });

    it('should fallback to execCommand if clipboard API fails', async () => {
      const writeTextMock = vi.fn().mockRejectedValue(new Error('Failed'));
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        writable: true,
      });

      const execCommandSpy = vi.spyOn(document, 'execCommand').mockReturnValue(true);
      const appendChildSpy = vi.spyOn(document.body, 'appendChild');
      const removeChildSpy = vi.spyOn(document.body, 'removeChild');

      await copyTextToClipboard('test content');
      
      expect(writeTextMock).toHaveBeenCalledWith('test content');
      expect(execCommandSpy).toHaveBeenCalledWith('copy');
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
    });
  });

  describe('downloadTextFile', () => {
    beforeEach(() => {
      global.URL.createObjectURL = vi.fn().mockReturnValue('blob:test');
      global.URL.revokeObjectURL = vi.fn();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should create an anchor element and click it', () => {
      const appendChildSpy = vi.spyOn(document.body, 'appendChild');
      
      downloadTextFile('AGENTS.md', 'test content');
      
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      
      // Verify anchor tags were created and appended
      const calls = appendChildSpy.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      
      const el = calls[0][0] as HTMLAnchorElement;
      expect(el.tagName).toBe('A');
      expect(el.download).toBe('AGENTS.md');
      expect(el.href).toBe('blob:test');
    });

    it('should extract basename for paths with folders', () => {
      const appendChildSpy = vi.spyOn(document.body, 'appendChild');
      
      downloadTextFile('specgate-agent-export/antigravity-workflows.md', 'test content');
      
      const calls = appendChildSpy.mock.calls;
      const el = calls[0][0] as HTMLAnchorElement;
      expect(el.download).toBe('antigravity-workflows.md');
    });
  });
});
