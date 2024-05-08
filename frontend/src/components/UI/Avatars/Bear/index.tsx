import { notionists } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";

interface BearProps {
    input: string;
    extraClass?: string;
  }
  
  const Bear = ({ input, extraClass }: BearProps) => {
    const avatar = createAvatar(notionists, {
      seed: input,
      // ... other options
    });
  
    const svg = avatar.toDataUriSync();
  
    return (
      <div className="rounded-full bg-teal-300">
        <img className={`${extraClass && extraClass}`} src={svg} />
      </div>
    );
  };

  export default Bear;