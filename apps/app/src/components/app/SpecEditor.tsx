import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

export function SpecEditor({
  value,
  onChange,
  onPlainTextChange,
  readOnly = false,
}: {
  value: any;
  onChange: (value: any) => void;
  onPlainTextChange: (text: string) => void;
  readOnly?: boolean;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '',
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
      onPlainTextChange(editor.getText());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4',
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
    <div className={`border rounded-lg bg-background ${readOnly ? 'opacity-70' : ''}`}>
      {!readOnly && (
        <div className="flex items-center gap-2 border-b p-2 bg-muted/50 rounded-t-lg flex-wrap">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={`px-2 py-1 text-xs font-medium rounded ${editor.isActive('bold') ? 'bg-secondary' : 'hover:bg-secondary'}`}
          >
            Bold
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={`px-2 py-1 text-xs font-medium rounded ${editor.isActive('italic') ? 'bg-secondary' : 'hover:bg-secondary'}`}
          >
            Italic
          </button>
          <div className="w-px h-4 bg-border mx-1" />
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-2 py-1 text-xs font-medium rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-secondary' : 'hover:bg-secondary'}`}
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-2 py-1 text-xs font-medium rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-secondary' : 'hover:bg-secondary'}`}
          >
            H2
          </button>
          <div className="w-px h-4 bg-border mx-1" />
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-2 py-1 text-xs font-medium rounded ${editor.isActive('bulletList') ? 'bg-secondary' : 'hover:bg-secondary'}`}
          >
            Bullet List
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-2 py-1 text-xs font-medium rounded ${editor.isActive('orderedList') ? 'bg-secondary' : 'hover:bg-secondary'}`}
          >
            Ordered List
          </button>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
