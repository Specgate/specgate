import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Image as ImageIcon, Link as LinkIcon, Loader2 } from 'lucide-react';
import { Button } from '@corely/ui';
import Image from '@tiptap/extension-image';
import { Plugin, PluginKey } from '@tiptap/pm/state';

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      assetId: { default: null },
      storageKey: { default: null },
      fileName: { default: null },
      contentType: { default: null },
    };
  },
});

export function RichTextEditor({
  value,
  onChange,
  onPlainTextChange,
  readOnly = false,
  placeholder = "",
  onImageUpload,
}: {
  value: unknown;
  onChange: (value: unknown) => void;
  onPlainTextChange: (text: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  onImageUpload?: (files: FileList | File[]) => Promise<Array<{ url: string; assetId: string; storageKey: string; fileName: string; contentType: string }>>;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      CustomImage,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value || '',
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
      onPlainTextChange(editor.getText());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[500px] py-4',
      },
      handlePaste: (view, event) => {
        const hasFiles = event.clipboardData && event.clipboardData.files && event.clipboardData.files.length > 0;
        if (!hasFiles || !onImageUpload) return false;
        
        event.preventDefault();
        onImageUpload(event.clipboardData.files).then((assets) => {
          assets.forEach((asset) => {
            const { schema } = view.state;
            const node = schema.nodes.image.create({
              src: asset.url,
              assetId: asset.assetId,
              storageKey: asset.storageKey,
              fileName: asset.fileName,
              contentType: asset.contentType,
            });
            const tr = view.state.tr.replaceSelectionWith(node);
            view.dispatch(tr);
          });
        });
        return true;
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
          if (!onImageUpload) return false;
          event.preventDefault();
          
          const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
          if (!coordinates) return false;
          
          onImageUpload(event.dataTransfer.files).then((assets) => {
            assets.forEach((asset) => {
              const { schema } = view.state;
              const node = schema.nodes.image.create({
                src: asset.url,
                assetId: asset.assetId,
                storageKey: asset.storageKey,
                fileName: asset.fileName,
                contentType: asset.contentType,
              });
              const tr = view.state.tr.insert(coordinates.pos, node);
              view.dispatch(tr);
            });
          });
          return true;
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor && value && !editor.isFocused) {
      if (JSON.stringify(editor.getJSON()) !== JSON.stringify(value)) {
        editor.commands.setContent(value);
      }
    }
  }, [value, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly);
    }
  }, [readOnly, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`relative flex flex-col ${readOnly ? 'opacity-70' : ''}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
          white-space: pre-wrap;
        }
      `}} />
      {!readOnly && (
        <div className="sticky top-[var(--header-height,73px)] z-10 flex items-center gap-1 border-b border-border bg-background/95 backdrop-blur py-2 mb-4 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={`h-8 w-8 p-0 ${editor.isActive('bold') ? 'bg-secondary' : ''}`}
            title="Bold"
          >
            <Bold className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={`h-8 w-8 p-0 ${editor.isActive('italic') ? 'bg-secondary' : ''}`}
            title="Italic"
          >
            <Italic className="h-4 w-4 text-muted-foreground" />
          </Button>
          <div className="w-px h-4 bg-border mx-1" />
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`h-8 w-8 p-0 ${editor.isActive('heading', { level: 1 }) ? 'bg-secondary' : ''}`}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`h-8 w-8 p-0 ${editor.isActive('heading', { level: 2 }) ? 'bg-secondary' : ''}`}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4 text-muted-foreground" />
          </Button>
          <div className="w-px h-4 bg-border mx-1" />
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`h-8 w-8 p-0 ${editor.isActive('bulletList') ? 'bg-secondary' : ''}`}
            title="Bullet List"
          >
            <List className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`h-8 w-8 p-0 ${editor.isActive('orderedList') ? 'bg-secondary' : ''}`}
            title="Ordered List"
          >
            <ListOrdered className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      )}
      <EditorContent editor={editor} className="flex-1" />
    </div>
  );
}
