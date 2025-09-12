'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { cn } from '@/lib/utils';
import { Bold, Italic, List, ListOrdered, Code, Quote } from 'lucide-react';

interface TiptapEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  id?: string;
  rows?: number;
}

const TiptapEditor = React.forwardRef<HTMLDivElement, TiptapEditorProps>(
  ({ value = '', onChange, onBlur, placeholder = '', className, id, rows = 4 }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          paragraph: {
            HTMLAttributes: {
              class: 'min-h-[1rem]',
            },
          },
        }),
      ],
      content: value,
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class: cn(
            'prose prose-sm max-w-none focus:outline-none px-3 py-2',
            `min-h-[${rows * 2 - 3}rem]`,
            '[&_p]:m-0 [&_p]:leading-relaxed',
            '[&_ul]:mt-2 [&_ul]:mb-2 [&_ul]:pl-4',
            '[&_ol]:mt-2 [&_ol]:mb-2 [&_ol]:pl-4',
            '[&_li]:leading-relaxed',
            '[&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic',
            '[&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm'
          ),
        },
        handleDOMEvents: {
          focus: () => {
            setIsFocused(true);
            return false;
          },
          blur: () => {
            setIsFocused(false);
            onBlur?.();
            return false;
          },
        },
      },
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        onChange?.(html === '<p></p>' ? '' : html);
      },
    });

    // Update editor content when value prop changes
    useEffect(() => {
      if (editor && value !== editor.getHTML() && value !== '') {
        editor.commands.setContent(value);
      } else if (editor && value === '' && editor.getHTML() !== '<p></p>') {
        editor.commands.clearContent();
      }
    }, [editor, value]);

    // Toolbar button component
    const ToolbarButton = ({ 
      onClick, 
      isActive = false, 
      children, 
      title 
    }: { 
      onClick: () => void; 
      isActive?: boolean; 
      children: React.ReactNode;
      title: string;
    }) => (
      <button
        type="button"
        onClick={onClick}
        title={title}
        className={cn(
          "p-1.5 rounded hover:bg-gray-100 transition-colors",
          isActive && "bg-gray-100 text-blue-600"
        )}
      >
        {children}
      </button>
    );

    if (!editor) {
      return (
        <div 
          className={cn(
            "rounded-md border border-gray-300 bg-transparent",
            className
          )}
          style={{ minHeight: `${rows * 2}rem` }}
        >
          <div className="border-b border-gray-200 p-2">
            <div className="flex gap-1 opacity-50">
              <div className="p-1.5"><Bold size={16} /></div>
              <div className="p-1.5"><Italic size={16} /></div>
            </div>
          </div>
          <div className="px-3 py-2 text-sm text-gray-400">
            {placeholder}
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        id={id}
        className={cn(
          "rounded-md border border-gray-300 bg-transparent focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          className
        )}
      >
        {/* Toolbar */}
        <div className="border-b border-gray-200 p-2 bg-gray-50/50">
          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="Bold (Ctrl+B)"
            >
              <Bold size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="Italic (Ctrl+I)"
            >
              <Italic size={16} />
            </ToolbarButton>
            <div className="w-px bg-gray-300 mx-1" />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              title="Bullet List"
            >
              <List size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              title="Numbered List"
            >
              <ListOrdered size={16} />
            </ToolbarButton>
            <div className="w-px bg-gray-300 mx-1" />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive('code')}
              title="Code"
            >
              <Code size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              title="Quote"
            >
              <Quote size={16} />
            </ToolbarButton>
          </div>
        </div>

        {/* Editor */}
        <div className="relative" style={{ minHeight: `${rows * 2 - 3}rem` }}>
          <EditorContent editor={editor} />
          {!editor.getText() && !isFocused && placeholder && (
            <div className="absolute top-2 left-3 text-gray-400 text-sm pointer-events-none">
              {placeholder}
            </div>
          )}
        </div>
      </div>
    );
  }
);

TiptapEditor.displayName = 'TiptapEditor';

export { TiptapEditor };