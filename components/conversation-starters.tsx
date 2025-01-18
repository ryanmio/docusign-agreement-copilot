import { motion } from 'framer-motion';
import { Button } from './ui/button';

interface ConversationStartersProps {
  onSelect: (prompt: string) => void;
}

export function ConversationStarters({ onSelect }: ConversationStartersProps) {
  const suggestedActions = [
    {
      title: "Check agreements",
      label: "needing attention",
      action: "Which agreements need my attention today?"
    },
    {
      title: "Check renewals",
      label: "expiring soon",
      action: "Show me agreements that need renewal soon"
    },
    {
      title: "Send an NDA",
      label: "to a new client",
      action: "I need to send our standard NDA template to a new client"
    },
    {
      title: "Send reminders",
      label: "for unsigned documents",
      action: "I want to view documents waiting for signature and send reminders for each one"
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
            className="text-left bg-white border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start hover:bg-accent"
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