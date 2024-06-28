import { useContext, useEffect, useState } from "react";
import { appContext } from "../../AppContext";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";
import Confetti from "react-confetti"


const Secret = () => {
  const { loaded, updatePreferredNetwork, _userKeys } = useContext(appContext);
  const { _network } = useWalletContext();


  const [showConfetti, setShowConfetti] = useState(false);
  

  const switchNetwork = () => {
    if (loaded && loaded.current) {
      if (_network === "sepolia") {
        // switch to mainnet
        updatePreferredNetwork("mainnet");
      } else {
        // switch to sepolia
        updatePreferredNetwork("sepolia");
      }

      setShowConfetti(true);
    }
  };

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!_userKeys) return;

    switchNetwork();
  }, [_userKeys, loaded]);

  return (
    <div className="grid grid-cols-[1fr_minmax(0,_560px)_1fr]">
      <div />
      <div className="grid grid-rows-3 px-3 md:px-0">
        <div/>
        <div className="text-center grid gap-4">
        
        {showConfetti&&
        <Confetti
        width={dimensions.width}
        height={dimensions.height}
    />
        }    
        <h1 className="text-center">Secret lab 🎉🥳🪩</h1>
        <button className="font-bold tracking-widest text-lg opacity-10 hover:opacity-100 bg-red-500 py-8" type="button" onClick={() => switchNetwork()}>
          Click to switch networks..
        </button>
        
        
         <p className="text-xs">PS Paddy thank god for Me..</p>

        </div>
        <div/>
      </div>
      <div />
    </div>
  );
};

export default Secret;
