/***
 * vue-router 作为一个插件；需要实现VueRouter类和install 方法；
 *  实现两个全局组件vue-view&&vue-link
 *  监听url的变化：监听hashChange or popstate 事件，
 *  当url发生变化的时候：响应最新的url; 
 *  创建一个响应式的属性current,存储当前的url，当ta改变的时候，获取对应的组件并显示；
 * 
*/



// 引用传入vue的构造函数；
let Vue;

// 1、实现VueRouter类  new VueRouter({routes:[{...}]});
class VueRouter{
    constructor(options){
        this.$options=options;
        // 处理routes
        this.routeMap={};
        this.$options.routes.forEach(route => {
            this.routeMap[route.path]=route;
        });

         // 1.1创建响应式属性current,存储当前url，
    const initial=window.location.hash.slice(1)||'/';
    
    Vue.util.defineReactive(this,'current',initial);


    // 1.2 监听hashChange事件；
    window.addEventListener('hashchange',this.onHashChange.bind(this));

    window.addEventListener('load',this.onHashChange.bind(this));
    }
    
    onHashChange(){
        this.current=window.location.hash.slice(1);
    }
}

// 实现install 方法； 注册$router;
VueRouter.install=function(_vue){
    // 引用构造函数；
    Vue=_vue;
    // task1: Vue原型上挂载$router;通过混入的方式，上下文已经是实例this了；
    Vue.mixin({
        beforeCreate(){
            // 只有根组件拥有router选项；
            if(this.$options.router){
                //   vm.$router;
                Vue.prototype.$router=this.$options.router;

            }
        }
    })

    // task2:全局注册两个组件router-view && router-link;
    Vue.component('router-view',{
        // h createElement shothands ;
        render(h){
            const {routeMap,current}=this.$router;
            const component=routeMap[current]?routeMap[current].component:null
            // 通过h渲染路由route中的按需加载的组件；
           return  h(component)
        }
    });
    // <router-link to='/'></router-link>
    Vue.component('router-link',{
        // 通过属性to获取跳转路径；
        props:{
            to:{
                type:String,
                default:''
            },

        },
        // 通过reader function 中的h 函数渲染一个a 标签；
        render(h){
            // h(tabName,attrs,children)
            return h('a',
            {attrs:{
                href:'#'+this.to
                },   
            },
            this.$slots.default)

       // 也可以使用jsx
      // return <a href={'#' + this.to}>{this.$slots.default}</a>
        }

    });
}

export default VueRouter;