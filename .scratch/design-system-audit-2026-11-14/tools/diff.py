import json,sys
a=json.load(open(sys.argv[1])); b=json.load(open(sys.argv[2]))
tot=0
for page in a:
    for st in a[page]:
        x=a[page][st]; y=b.get(page,{}).get(st)
        if y is None: print(page,st,'MISSING'); tot+=1; continue
        if len(x)!=len(y): print(page,st,'count',len(x),'->',len(y)); tot+=1; continue
        d=[(i,p,q) for i,(p,q) in enumerate(zip(x,y)) if p!=q]
        if d:
            tot+=len(d); print(page,st,len(d),'diffs')
            for i,p,q in d[:int(sys.argv[3]) if len(sys.argv)>3 else 2]:
                pa,qa=p.split(' :: '),q.split(' :: ')
                for k,(u,v) in enumerate(zip(pa,qa)):
                    if u!=v:
                        if k==2:
                            us,vs=u.split('|'),v.split('|'); print('   #%d %s style idx'%(i,pa[0]),[(j,m,n) for j,(m,n) in enumerate(zip(us,vs)) if m!=n][:4])
                        else: print('   #%d %s field%d: %s -> %s'%(i,pa[0],k,u[:70],v[:70]))
print('total diffs',tot)
