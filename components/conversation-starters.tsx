import { motion } from 'framer-motion';
import { Button } from './ui/button';

interface ConversationStartersProps {
  onSelect: (prompt: string) => void;
}

export function ConversationStarters({ onSelect }: ConversationStartersProps) {
  const suggestedActions = [
    {
      title: "Send an NDA",
      label: "to a new client",
      action: "I need to send our standard NDA to a new client"
    },
    {
      title: "Check status",
      label: "of pending documents",
      action: "What documents are pending my signature?"
    },
    {
      title: "Send reminder",
      label: "for unsigned documents",
      action: "Send a reminder for unsigned documents"
    },
    {
      title: "View priorities",
      label: "for today",
      action: "What are my urgent priorities today?"
    }
  ];

  return (
    <div className="grid sm:grid-cols-2 gap-2 w-full mb-4">
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${index}`}
          className={index > 1 ? 'hidden sm:block' : 'block'}
        >
          <Button
            variant="outline"
            onClick={() => onSelect(suggestedAction.action)}
            className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start hover:bg-accent"
          >
            <span className="font-medium">{suggestedAction.title}</span>
            <span className="text-muted-foreground">
              {suggestedAction.label}
            </span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
} 