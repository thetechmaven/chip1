import { useEffect, useState } from 'react';
import prompts from '../../../prompts.json';
import Layout from '../Layout';

function Prompts() {
  const [open, setOpen] = useState('');
  const [data, setData] = useState<any>();

  useEffect(() => {
    setData(undefined);
  }, [open]);

  return (
    <Layout heading="Prompts">
      <div className="border rounded-md border-b-2 text-[14px]">
        {Object.keys(prompts).map((key) => {
          return (
            <div key={key} className="border-b">
              <div
                className={
                  'p-2 border-b ' + (open === key ? 'bg-gray-200' : '')
                }
                onClick={() => setOpen(open === key ? '' : key)}
              >
                <h2 className="font-bold">{key}</h2>
              </div>
              <div className={' ' + (open === key ? 'block' : 'hidden')}>
                <p className="p-2">
                  <textarea
                    defaultValue={(prompts as any)[key]}
                    className="w-full h-[300px]"
                    onChange={(e) => {
                      setData({
                        key,
                        value: e.target.value,
                      });
                    }}
                  />
                  <div>
                    <button
                      className="bg-blue-500 text-white p-2 rounded-md"
                      onClick={() => {
                        if (data) {
                          const newPrompts = { ...prompts };
                          //newPrompts[data.key] = data.value;
                          //localStorage.setItem("prompts", JSON.stringify(newPrompts));
                          window.location.reload();
                        }
                      }}
                    >
                      Save
                    </button>
                  </div>
                </p>
                <div className="border-t text-gray-400 p-2">Hello World</div>
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}

export default Prompts;
