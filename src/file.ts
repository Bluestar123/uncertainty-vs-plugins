"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 * @param name file name
 */ 
exports.files = function (name: string) {
	const page = {
		js:
`
import wekf from "@tencent/kakashi-wekf";
const { regeneratorRuntime } = global

class ${name.charAt(0).toUpperCase() + name.slice(1)} extends wekf.WePage {
	data = {
		
	}
}
wekf.createPage(${name.charAt(0).toUpperCase() + name.slice(1)})
`,
wxss: `/**${name}.wxss**/`,
json: `{
  "usingComponents": {}
}`,
wxml: `<!--${name}.wxml-->
<view>我是${name}</view>`
	};
	return {
		page
	};
};
