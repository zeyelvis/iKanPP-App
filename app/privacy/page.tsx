import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '隐私政策 (Privacy Policy) | iKanPP 爱看片片',
  description: 'iKanPP 平台隐私保护政策，了解我们如何严格保护全球海外华人用户的数据隐私与账号安全。',
  keywords: ['iKanPP隐私政策', '爱看片片隐私条款', 'iKanPP Privacy Policy'],
  alternates: {
    canonical: 'https://www.ikanpp.com/privacy',
  },
};

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen py-20 px-4">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold mb-2" style={{
                    background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>隐私条款</h1>
                <p className="text-xs opacity-40 mb-10" style={{ color: 'var(--text-color-secondary)' }}>
                    最后更新日期：2026 年 3 月 16 日
                </p>

                <div className="space-y-8 text-sm leading-relaxed" style={{ color: 'var(--text-color-secondary)' }}>

                    <section>
                        <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-color)' }}>一、信息收集</h2>
                        <p className="opacity-70 mb-3">为了提供和改善服务，我们可能收集以下信息：</p>
                        <ul className="list-disc list-inside space-y-2 opacity-70">
                            <li><strong>账号信息</strong>：注册时提供的电子邮箱地址。</li>
                            <li><strong>设备信息</strong>：为实现多设备登录限制，我们会生成并存储匿名设备标识符（Device ID），不包含设备型号、IMEI 等硬件信息。</li>
                            <li><strong>使用数据</strong>：观看历史、收藏记录、搜索记录，用于提供个性化推荐和断点续播功能。</li>
                            <li><strong>日志数据</strong>：访问时间、IP 地址、浏览器类型，用于安全防护和服务优化。</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-color)' }}>二、信息使用</h2>
                        <p className="opacity-70 mb-3">我们使用收集的信息用于以下目的：</p>
                        <ul className="list-disc list-inside space-y-2 opacity-70">
                            <li>提供、维护和改进本站服务。</li>
                            <li>验证用户身份，管理用户账号。</li>
                            <li>实施多设备登录限制，保障账号安全。</li>
                            <li>生成匿名统计数据，用于分析服务使用趋势。</li>
                            <li>防范恶意行为，保护用户和平台安全。</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-color)' }}>三、信息存储</h2>
                        <ul className="list-disc list-inside space-y-2 opacity-70">
                            <li><strong>本地存储</strong>：观看历史、收藏、搜索记录等存储在用户浏览器的 LocalStorage 中，仅限用户本人访问。</li>
                            <li><strong>云端存储</strong>：账号信息和会话数据通过 Supabase 平台安全存储，采用行级安全策略（RLS）确保用户只能访问自己的数据。</li>
                            <li><strong>数据保留</strong>：账号删除后，相关数据将在 30 天内完全清除。</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-color)' }}>四、信息共享</h2>
                        <p className="opacity-70 mb-3">我们承诺不会将您的个人信息出售给第三方。以下情况除外：</p>
                        <ul className="list-disc list-inside space-y-2 opacity-70">
                            <li>经您明确同意的情况。</li>
                            <li>法律法规要求或国家机关依法查询。</li>
                            <li>为保护本站、用户或公众的权益、财产或安全。</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-color)' }}>五、Cookie 与追踪技术</h2>
                        <ul className="list-disc list-inside space-y-2 opacity-70">
                            <li>本站使用 Cookie 和 LocalStorage 来维持登录状态和存储用户偏好设置。</li>
                            <li>我们不使用第三方广告追踪 Cookie。</li>
                            <li>您可以通过浏览器设置管理或删除 Cookie，但这可能影响部分功能的正常使用。</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-color)' }}>六、数据安全</h2>
                        <p className="opacity-70">
                            我们采取合理的技术和管理措施保护用户信息安全，包括但不限于：数据传输加密（HTTPS）、密码哈希存储、数据库行级安全策略（RLS）、会话超时自动清理。但请注意，互联网传输不存在绝对安全的方法，我们无法保证 100% 的安全性。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-color)' }}>七、用户权利</h2>
                        <p className="opacity-70 mb-3">您对自己的个人信息享有以下权利：</p>
                        <ul className="list-disc list-inside space-y-2 opacity-70">
                            <li><strong>访问权</strong>：您可以随时在个人中心查看自己的账号信息。</li>
                            <li><strong>删除权</strong>：您可以随时清除浏览器中的本地数据（历史记录、收藏等）。</li>
                            <li><strong>注销权</strong>：您可以通过联系我们申请注销账号，我们将在 30 天内处理。</li>
                            <li><strong>更正权</strong>：您可以随时修改个人资料信息。</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-color)' }}>八、未成年人保护</h2>
                        <p className="opacity-70">
                            本站部分内容可能不适合未成年人。未满 18 周岁的用户应在法定监护人的陪同和指导下使用本站服务。若我们发现未经监护人同意收集了未成年人的个人信息，将立即删除相关数据。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-color)' }}>九、隐私条款更新</h2>
                        <p className="opacity-70">
                            我们可能不时更新本隐私条款。更新后的版本将在本页面发布并即时生效。建议您定期查阅，以了解我们如何保护您的信息。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-color)' }}>十、联系方式</h2>
                        <p className="opacity-70">
                            如您对本隐私条款有任何问题或建议，请联系：<br />
                            邮箱：<a href="mailto:zeyelvis@icloud.com" style={{ color: '#60a5fa' }}>zeyelvis@icloud.com</a>
                        </p>
                    </section>

                </div>
            </div>
        </div>
    );
}
