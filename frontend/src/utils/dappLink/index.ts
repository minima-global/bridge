export function dAppLink(dAppName: string): any {
    return new Promise((resolve, reject) => {
      (window as any).MDS.dapplink(dAppName, function (response: any) {
        if (response.status) {
          return resolve(response);
        }
  
        return reject();
      });
    });
  }