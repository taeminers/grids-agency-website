export const CodeExample = () => {
    return (
        <div className="relative lg:row-span-2">
            <div className="absolute inset-px rounded-lg bg-muted max-lg:rounded-b-4xl lg:rounded-r-4xl" />
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-b-[calc(2rem+1px)] lg:rounded-r-[calc(2rem+1px)]">
              <div className="px-8 pt-8 pb-3 sm:px-10 sm:pt-10 sm:pb-0">
                <p className="mt-2 text-lg font-medium tracking-tight text-foreground max-lg:text-center">Developer Webhooks</p>
                <p className="mt-2 max-w-lg text-sm/6 text-muted-foreground max-lg:text-center">
                  Integrate with your existing tools and workflows.
                </p>
              </div>
              <div className="relative min-h-120 w-full grow">
                <div className="absolute top-10 right-0 bottom-0 left-10 overflow-hidden rounded-tl-xl bg-muted shadow-2xl outline outline-foreground/10">
                  <div className="flex bg-muted outline outline-foreground/5">
                    <div className="-mb-px flex text-sm/6 font-medium text-muted-foreground">
                      <div className="border-r border-b border-r-foreground/10 border-b-foreground/20 bg-foreground/5 px-4 py-2 text-foreground">
                        route.ts
                      </div>
                      <div className="border-r border-foreground/10 px-4 py-2">webhook.json</div>
                    </div>
                  </div>
                  <div className="px-6 pt-6 pb-14 text-sm/6 text-gray-300 font-mono">
                    <p><span className="text-pink-400">export</span> <span className="text-pink-400">async</span> <span className="text-pink-400">function</span> <span className="text-yellow-300">POST</span>(<span className="text-blue-400">req</span>) {'{'}</p>
                    <p className="pl-4"><span className="text-pink-400">const</span> body = <span className="text-pink-400">await</span> req.<span className="text-blue-400">json</span>()</p>
                    <p className="pl-4">&nbsp;</p>
                    <p className="pl-4"><span className="text-pink-400">if</span> (body.<span className="text-slate-400">event</span> === <span className="text-green-400">'lead.created'</span>) {'{'}</p>
                    <p className="pl-8"><span className="text-pink-400">await</span> <span className="text-yellow-300">syncToCRM</span>(body.<span className="text-slate-400">data</span>)</p>
                    <p className="pl-8"><span className="text-pink-400">await</span> <span className="text-yellow-300">notifySlack</span>(body.<span className="text-slate-400">data</span>)</p>
                    <p className="pl-4">{'}'}</p>
                    <p className="pl-4">&nbsp;</p>
                    <p className="pl-4"><span className="text-pink-400">return</span> Response.<span className="text-blue-400">json</span>({'{'} <span className="text-slate-400">ok:</span> <span className="text-blue-400">true</span> {'}'})</p>
                    <p>{'}'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg shadow-sm outline outline-black/5 max-lg:rounded-b-4xl lg:rounded-r-4xl" />
          </div>
    )
}