import { Upload } from '@phosphor-icons/react';
import { ReactNode } from 'react';

interface EmptyProps {
  icon: JSX.Element;
  title: string;
  subtitle: string;
  action?: {
    text: string;
    icon: typeof Upload;
    style: 'plain' | 'elevated';
    onClick: () => void;
  };
  contextMenuClick?: (event: any) => void;
}

export default function Empty({ icon, title, subtitle, action, contextMenuClick }: EmptyProps): JSX.Element {
  let button: ReactNode = null;

  if (action) {
    button = (
      <button
        onClick={action.onClick}
        className={`mx-auto flex items-center rounded-lg ${
          action.style === 'elevated'
            ? 'mt-5 bg-primary/10 hover:bg-primary/15 active:bg-primary/20'
            : 'mt-2.5 bg-transparent'
        } h-10 px-5 font-medium text-primary`}
      >
        {action.text}
        <action.icon className="ml-2" size={20} weight="bold" />
      </button>
    );
  }

  return (
    <div className="h-full w-full p-8" onContextMenu={contextMenuClick}>
      <div className="flex h-full flex-col items-center justify-center pb-20">
        <div className="pointer-events-none mx-auto mb-10 w-max">{icon}</div>
        <div className="pointer-events-none text-center">
          <p className="mb-1 block text-3xl font-semibold text-gray-100">{title}</p>
          <p className="block text-lg text-gray-60">{subtitle}</p>
        </div>
        {button}
      </div>
    </div>
  );
}
