import Vue from 'vue';
import {
  Container,
  Aside,
  Main,
  Footer,
  Header,
  Button,
  Dialog,
  Form,
  FormItem,
  Input,
  Card,
  Popover,
  Table,
  TableColumn,
  Switch,
  Tooltip,
  Checkbox,
  CheckboxGroup,
  Breadcrumb,
  BreadcrumbItem,
  Col,
  Row,
  MessageBox,
  Pagination,
  Loading} from "element-ui";
Vue.use(Container)
Vue.use(Footer)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Header)
Vue.use(Button)
Vue.use(Dialog)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Card)
Vue.use(Popover)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Switch)
Vue.use(Tooltip)
Vue.use(Checkbox)
Vue.use(CheckboxGroup)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Col)
Vue.use(Row)
Vue.use(Pagination)
Vue.use(Loading.directive);
Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$loading = Loading.service;