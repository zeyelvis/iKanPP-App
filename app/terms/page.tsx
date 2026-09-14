import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '服务条款 (Terms of Service) | iKanPP 爱看片片',
  description: 'iKanPP 平台用户服务协议与法律声明，了解使用聚合搜索与播放服务的条款与规范。',
  keywords: ['iKanPP服务条款', '爱看片片用户协议', 'iKanPP Terms of Service'],
  alternates: {
    canonical: 'https://www.ikanpp.com/terms',
  },
};

export default function TermsOfService() {
    return (
        <div className="min-h-screen py-20 px-4">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold mb-2" style={{
                    background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>用户协议</h1>
                <p className="text-xs opacity-40 mb-10" style={{ color: 'var(--text-color-secondary)' }}>
                    最后更新日期：2026 年 3 月 16 日
                </p>

                <div className="space-y-8 text-sm leading-relaxed" style={{ color: 'var(--text-color-secondary)' }}>

                    <section>
                        <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-color)' }}>一、服务说明</h2>
                        <p className="opacity-70">
                            iKanPP（以下简称"本站"）是一个影视内容聚合搜索平台，为用户提供便捷的在线影视搜索和播放引导服务。本站不存储任何视频或图片资源，所有内容均通过搜索和聚合第三方网站的公开资源提供。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-color)' }}>二、用户注册与账号</h2>
                        <ul className="list-disc list-inside space-y-2 opacity-70">
                            <li>用户注册时需提供有效的电子邮箱地址，并设置符合安全要求的密码。</li>
                            <li>每个用户仅允许注册一个账号，禁止使用虚假信息注册。</li>
                            <li>用户有责任妥善保管账号信息，因账号被盗或被他人使用而造成的损失，本站不承担责任。</li>
                            <li>同一账号最多允许 3 台设备同时登录使用，超出限制将自动登出最早的设备。</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-color)' }}>三、VIP 会员服务</h2>
                        <ul className="list-disc list-inside space-y-2 opacity-70">
                            <li>VIP 会员可通过邀请码注册获得试用体验。</li>
                            <li>VIP 权益包括但不限于：访问高级内容、减少广告展示、专属标签筛选等。</li>
                            <li>VIP 会员权益不可转让、不可出租，不得与他人共享账号。</li>
                            <li>本站保留在违反协议时取消用户 VIP 资格的权利。</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-color)' }}>四、用户行为规范</h2>
                        <p className="opacity-70 mb-2">用户在使用本站服务时，不得从事以下行为：</p>
                        <ul className="list-disc list-inside space-y-2 opacity-70">
                            <li>利用本站从事任何违法违规活动。</li>
                            <li>通过技术手段干扰或破坏本站正常运作。</li>
                            <li>恶意注册大量账号、利用机器人自动化访问或爬取内容。</li>
                            <li>将本站内容用于商业目的或未经授权的二次分发。</li>
                            <li>上传、发布或传播含有恶意代码或有害信息的内容。</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-color)' }}>五、知识产权声明</h2>
                        <p className="opacity-70">
                            本站所有视频和图片均来自互联网收集，版权归原创者所有。本站仅提供 Web 页面服务，不提供资源存储，也不参与录制、上传。若本站收录的节目无意侵犯了贵司版权，请附上版权证明邮件至
                            <a href="mailto:contact@ikanpp.com" className="mx-1" style={{ color: '#60a5fa' }}>contact@ikanpp.com</a>
                            （我们会在收到邮件后 48 小时内删除）。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-color)' }}>六、免责条款</h2>
                        <ul className="list-disc list-inside space-y-2 opacity-70">
                            <li>本站提供的内容均来自第三方公开资源，本站不对其准确性、合法性或完整性作出保证。</li>
                            <li>本站不对因使用本站服务而产生的任何直接或间接损失承担责任。</li>
                            <li>本站不保证服务的连续性和稳定性，可能因系统维护、升级或不可抗力因素而中断。</li>
                            <li>用户通过本站访问的第三方网站的内容和行为，本站不承担任何责任。</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-color)' }}>七、协议修改</h2>
                        <p className="opacity-70">
                            本站保留随时修改本协议的权利。修改后的协议将在本页面更新并即时生效。继续使用本站服务即视为同意修改后的协议。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-color)' }}>八、联系方式</h2>
                        <p className="opacity-70">
                            如您对本协议有任何疑问，请通过以下方式联系我们：<br />
                            邮箱：<a href="mailto:contact@ikanpp.com" style={{ color: '#60a5fa' }}>contact@ikanpp.com</a>
                        </p>
                    </section>

                </div>
            </div>
        </div>
    );
}
