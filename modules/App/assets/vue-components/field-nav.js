let editItem = {

    data() {

        let data = _.cloneDeep(this.item);

        if (!data.meta || Array.isArray(data.meta)) {
            data.meta = {};
        }

        return {
            data
        }
    },

    props: {
        item: {
            type: Object,
            default: null
        },
        fields: {
            type: Array,
            default: []
        },
        url: {
            type: Object,
            default: {
                type: 'field-text',
                opts: {
                    placeholder: 'https://...'
                }
            }
        }
    },

    components: {
        'fields-renderer': Vue.defineAsyncComponent(() => App.utils.import('system:assets/vue-components/fields-renderer.js'))
    },

    methods: {
        save() {
            Object.assign(this.item, this.data);
            this.$close();
        }
    },

    template: /*html*/`
        <div>

            <div class="kiss-size-4 kiss-text-bold kiss-margin-bottom">{{ t('Edit item') }}</div>

            <kiss-tabs class="kiss-margin-large">

                <tab :caption="t('General')">

                    <div class="kiss-margin">
                        <label class="kiss-size-small kiss-text-caption">{{ t('Title') }}</label>
                        <input class="kiss-input" type="text" v-model="data.title">
                    </div>
                    <div class="kiss-margin">
                        <label class="kiss-size-small kiss-text-caption">{{ t('Url') }}</label>
                        <component :is="url.type" v-model="data.url" v-bind="url.opts"></component>
                    </div>
                    <div class="kiss-margin">
                        <label class="kiss-size-small kiss-text-caption">{{ t('Target') }}</label>
                        <input class="kiss-input" type="text" v-model="data.target">
                    </div>

                    <fields-renderer class="kiss-margin-large" v-model="data.data" :fields="fields"></fields-renderer>
                </tab>
                <tab :caption="t('Meta')">
                    <field-object v-model="data.meta"></field-object>
                </tab>
            </kiss-tabs>

            <div class="kiss-margin-top kiss-flex kiss-flex-middle kiss-button-group">
                <button type="button" class="kiss-button kiss-flex-1" @click="$close()">{{ t('Cancel') }}</button>
                <button type="button" class="kiss-button kiss-button-primary kiss-flex-1" @click="save">{{ t('Save') }}</button>
            </div>
        </div>
    `
}


let instanceCount = 0;

export default {

    name: 'field-nav',

    _meta: {
        label: 'Navigation',
        info: 'Nested navigation tree',
        icon: 'system:assets/icons/list.svg',
        settings: [
            {name: 'fields', type: 'fields-manager'},
        ],
    },

    data() {
        return {
            uid: `field-nav-${++instanceCount}`,
            val: this.modelValue || []
        }
    },

    props: {
        modelValue: {
            type: Array,
            default: []
        },
        fields: {
            type: Array,
            default: []
        },
        group: {
            type: String,
            default: null
        },
        level: {
            type: Number,
            default: 0
        },
        url: {
            type: Object,
            default: {
                type: 'field-text',
                opts: {
                    placeholder: 'https://...'
                }
            }
        }
    },

    watch: {
        val: {
            handler() { this.update() },
            deep: true
        },
        modelValue() {
            this.val = this.modelValue || [];
            this.update();
        }
    },

    methods: {

        addItem(collection) {

            collection = collection || this.val;

            let data = {};

            (this.fields || []).forEach(field => {
                data[field.name] = field.default || null;
            });

            collection.push({
                title: '',
                url: '',
                target: '',
                data,
                children: []
            });
        },

        edit(item) {

            VueView.ui.modal(editItem, {item, fields: this.fields, url: this.url}, {

            }, {size: 'large'})
        },

        remove(item) {
            this.val.splice(this.val.indexOf(item), 1);
            this.update();
        },

        change(evt) {
            this.update();
        },

        update() {
            this.$emit('update:modelValue', this.val)
        }
    },

    template: /*html*/`
        <div field="nav">

            <vue-draggable
                :list="val"
                :group="group || uid"
                :swapThreshold="0.65"
                :animation="150",
		        :fallbackOnBody="true"
                @change="change"
                handle=".lm-handle"
                class="field-nav-dragarea"
            >
                <template #item="{ element }">
                    <div class="kiss-margin-xsmall">
                        <kiss-card class="kiss-padding-small kiss-margin-xsmall" theme="bordered shadowed" hover="contrast">
                            <div class="kiss-flex kiss-flex-middle">
                                <a class="lm-handle kiss-margin-small-right kiss-color-muted"><icon>drag_handle</icon></a>
                                <div class="kiss-flex-1 kiss-size-xsmall kiss-text-bold" :class="{'kiss-color-muted': !element.title}">
                                    <a class="kiss-link-muted" @click="edit(element)">{{ element.title || t('Title...') }}</a>
                                </div>
                                <a class="kiss-margin-small-left" @click="edit(element)"><icon>tune</icon></a>
                                <a class="kiss-margin-small-left" @click="addItem(element.children)"><icon>create_new_folder</icon></a>
                                <a class="kiss-margin-small-left kiss-color-danger" @click="remove(element)"><icon>delete</icon></a>
                            </div>
                        </kiss-card>

                        <div :style="{paddingLeft: (((level+1)*15)+'px')}">
                            <field-nav class="kiss-display-block" v-model="element.children" :group="group || uid" :fields="fields" :level="level+1" :url="url"></field-nav>
                        </div>
                    </div>
                </template>
            </vue-draggable>

            <div class="kiss-margin-small kiss-align-center" v-if="!level">
                <a @click="addItem()"><icon :class="{'kiss-size-small':level}">control_point</icon></a>
            </div>

        </div>
    `,
}