
function defineReactive(obj,key,val){
    // 递归处理；
    observe(val);
    // 创建一个dep 依赖收集实例；
    const dep=new Dep();
    Object.defineProperty(obj,key,{
        get(){
            return val
            // 依赖收集，只要是get就把对应的观察者watcher和被观察者expression关联起来；
            Dep.target&&dep.addDep(Dep.target);
        },
        set(newVal){
            if(newVal!==val){
                // 递归响应式处理一个对象；
                observe(newVal);
                obj[key]=newVal

                // 通知视图更新；
                dep.notify();
            }
        }
    })
}
class  Observe{
    constructor(value){
        this.value=value;
        this.walk(value)
    }
    // 遍历对象，将对象中的所有key设置响应式；（走一遍）
    walk(obj){
        
        Object.keys(obj).forEach((key)=>{
            defineReactive(obj,key,obj[key])
        });
    }

}

function observe(obj){
    if(typeof obj !=='object'|| obj==null){
        return ;
    }
    // 执行响应式处理；出现一个对象，就创建一个Observe实例；
    
     new Observe(obj);

}



function proxy(vm){
    Object.keys(vm.$data).forEach((key)=>{
        Object.defineProperty(vm,key,{
            get(){
                return vm.$data[key]
            },
            set(v){
                vm.$data[key]=v;
            }
        });
    })
}

 // Dep: 保存所有的watcher实例； 当某个key发生变化，通知他们执行更新；
 class Dep{
     constructor(){
        this.deps=[];
     }
     addDep(watcher){

        this.deps.push(watcher);
     }
     
     notify(){
         // 每个watcher实例偶读执行一次update();
         this.deps.forEach(dep=>dep.update());
     };

 }

/**
 * 观察者模式；Watcher，每一个观察者实例对应一个依赖；
 * 
*/
class Watch{
   constructor(vm,key,updateFn){
     this.vm=vm;
     this.key=key;
     this.updateFn=updateFn;

    // 读取当前expression，触发依赖收集；
    Dep.target=this;

   }

}


/**
 * @description 编译模板；
 * 解析模板，找到 依赖，依赖就是视图中的data属性与model中data中的属性的关联；
 *  new Compiler('#app',vm);
 * 
*/
class Compiler{
    constructor(el,vm){
        this.$vm=vm;
        this.$el=document.querySelector(el);
        // 执行编译；
        this.compile(this.$el);

    }

    /**
     * @description  执行编译；
     * 
    */

    compile(el){
        // 遍历dom el;
        el.childNodes.forEach(node=>{
            if(node.nodeType===1){
                // 是否四元素；  console.log('编译元素', node.nodeName)
                this.compileElement(node);
            }else if(this.isInter(node)){
                 // console.log('编译文本', node.textContent);
                this.compileText(node);
            }
        });
    }
     // 是否是文本节点；{{}}regExp这个对象会在我们调用了正则表达式的方法后, 自动将最近一次的结果保存在里面
    isInter(node){
        return node.nodeType===3&&/\{\{(.*)\}\}/.test(node.textContent)
    }
    // 解析绑定的{{}}
    compileText(node){
        // 获取正则表达式，获取expression; 
         // node.textContent = this.$vm[RegExp.$1]
         this.update(node,RegExp.$1, 'text');

    }

    /**
     * @description  div  span  .... 处理元素上面的属性；
     *  k-、 @ 
     * 
    */


    compileElement(node){
        const attrs =node.attributes;
        Array.from(attrs).forEach(attr=>{
              // attr:   {name: 'k-text', value: 'counter'}
              const attrName=attr.name;
              const exp=attr.value;
              // 对k-处理；
              if(attrName.indexOf('k-')===0){
                 // 获取指令名称；text
                 const dir=attrName.substring(2);
                 // 是否存在对应指令的方法，有则执行；
                 this[dir]&&this[dir](node,exp)
              }
              // 事件处理；
        })
     }

     // k-text

     text(node,exp){
          // node.textContent = this.$vm[exp]
         // 更新视图；
         this.update(node,exp,'text');
     }

     html(node,exp){
        // node.innerHTML=this.$vm[exp]
        this.update(node,exp,'html');
     }

     // update

     update(node,exp,dir){
        //  对应指令的更新函数是否存在，如果存在则执行updater;
        const fn =this[dir+'Updater'];
        fn&&fn(node,this.$vm[exp])

        // 每个依赖，都创建一个Watcher实例；
        new watcher(this.$vm,exp,val=>{
            fn&&fn(node,val)
        });
     }

     textUpdater(node,val){
        node.textContent=val;
     }
     
     htmlUpdater(node,val){
        node.innerHTML=val;
     }
}

// 创建一个Vue类；

class Vue{
    constructor(options){
        this.$options=options;
        this.$data=options.data;

      // 1、数据拦截和响应式处理
      observe(this.$data)
      // 2、 代理
      proxy(this)
  
      // 3、模板编译
      new Compiler('#app',this)
    }
  

}

