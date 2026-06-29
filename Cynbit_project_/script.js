/**
 * Mudit Portfolio - Core Interaction Script
 * Features:
 * - Theme Switcher (Dark/Light) with localStorage persistence
 * - Mobile Navigation Menu Toggle and automatic collapse
 * - Scroll-based Header Styling (Shrink)
 * - Dynamic Typewriter Tagline Animation
 * - Custom Scroll Reveal animations (AOS replacement)
 * - Dynamic Skill Bar expansion on viewport entry
 * - Active Section Indicator in Navigation
 * - Contact Form AJAX Submission with Formspree
 * - Floating Back-To-Top trigger
 */

const initPortfolioInteractions = () => {
    const safelyRun = (name, callback) => {
        try {
            callback();
        } catch (error) {
            console.error(`${name} failed:`, error);
        }
    };

    safelyRun('Theme Switcher', () => {
        const themeToggleBtn = document.getElementById('theme-toggle');
        const currentTheme = localStorage.getItem('theme');

        if (currentTheme === 'light') {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }

        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => {
                document.body.classList.toggle('light-theme');
                const nextTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
                localStorage.setItem('theme', nextTheme);
            });
        }
    });

    safelyRun('Header & Scroll Effects', () => {
        const header = document.getElementById('header');
        const backToTopBtn = document.getElementById('back-to-top');

        const handleScrollEffects = () => {
            const scrollPos = window.scrollY;
            if (header) {
                header.classList.toggle('shrink', scrollPos > 50);
            }
            if (backToTopBtn) {
                backToTopBtn.classList.toggle('show', scrollPos > 500);
            }
        };

        window.addEventListener('scroll', handleScrollEffects, { passive: true });
        handleScrollEffects();

        if (backToTopBtn) {
            backToTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'auto' });
            });
        }
    });

    safelyRun('Mobile Navigation', () => {
        const mobileNavToggle = document.getElementById('mobile-nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');

        if (mobileNavToggle && navMenu) {
            const toggleMobileMenu = () => {
                mobileNavToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
            };

            mobileNavToggle.addEventListener('click', toggleMobileMenu);
            navLinks.forEach((link) => {
                link.addEventListener('click', () => {
                    if (navMenu.classList.contains('active')) {
                        toggleMobileMenu();
                    }
                });
            });
        }
    });

    safelyRun('Typewriter Hero', () => {
        window.typewriterWords = window.typewriterWords || ['Full-Stack Developer', 'UI/UX Designer', 'Technical Writer', 'Problem Solver'];
        const typewriterElement = document.getElementById('typewriter-text');
        if (!typewriterElement) {
            return;
        }

        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 100;

        const runTypewriter = () => {
            const words = window.typewriterWords;
            const currentWord = words[wordIndex] || words[0] || 'Developer';
            if (isDeleting) {
                typewriterElement.textContent = currentWord.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 50;
            } else {
                typewriterElement.textContent = currentWord.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 120;
            }

            if (!isDeleting && charIndex === currentWord.length) {
                isDeleting = true;
                typingSpeed = 2000;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                typingSpeed = 500;
            }

            setTimeout(runTypewriter, typingSpeed);
        };

        runTypewriter();
    });

    safelyRun('Reveal Animations & Section Tracking', () => {
        const revealElements = document.querySelectorAll('.scroll-reveal');
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-link');

        if (window.IntersectionObserver) {
            const revealObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');

                        const barsInCard = entry.target.querySelectorAll('.skill-bar');
                        barsInCard.forEach((bar) => {
                            const progress = bar.getAttribute('data-progress');
                            if (progress) {
                                bar.style.width = progress;
                            }
                        });

                        observer.unobserve(entry.target);
                    }
                });
            }, { root: null, rootMargin: '0px', threshold: 0.15 });

            revealElements.forEach((element) => revealObserver.observe(element));

            const sectionObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const sectionId = entry.target.getAttribute('id');
                        navLinks.forEach((link) => {
                            link.classList.toggle('active', link.getAttribute('href') === `#${sectionId}`);
                        });
                    }
                });
            }, { root: null, rootMargin: '-30% 0px -60% 0px', threshold: 0 });

            sections.forEach((section) => sectionObserver.observe(section));
        } else {
            revealElements.forEach((element) => element.classList.add('revealed'));
        }
    });

    safelyRun('Resume to Portfolio Generator', () => {
        if (window.pdfjsLib) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }

        const resumeUploadInput = document.getElementById('resume-upload');
        const generatePortfolioBtn = document.getElementById('generate-portfolio-btn');
        const resumeUploadStatus = document.getElementById('resume-upload-status');
        const resumeFileName = document.getElementById('resume-file-name');
        const geminiApiKeyInput = document.getElementById('gemini-api-key');
        const toggleApiKeyBtn = document.getElementById('toggle-api-key');

        const generatedName = document.getElementById('generated-name');
        const generatedRole = document.getElementById('generated-role');
        const generatedSummary = document.getElementById('generated-summary');
        const generatedSkills = document.getElementById('generated-skills');
        const generatedExperience = document.getElementById('generated-experience');
        const processingOverlay = document.getElementById('processing-overlay');

        if (!resumeUploadInput || !generatePortfolioBtn || !generatedName || !generatedRole || !generatedSummary || !generatedSkills || !generatedExperience) {
            return;
        }

        // Setup API Key management
        if (geminiApiKeyInput && toggleApiKeyBtn) {
            const savedKey = localStorage.getItem('gemini_api_key');
            if (savedKey) {
                geminiApiKeyInput.value = savedKey;
            }

            geminiApiKeyInput.addEventListener('input', () => {
                localStorage.setItem('gemini_api_key', geminiApiKeyInput.value.trim());
            });

            toggleApiKeyBtn.addEventListener('click', () => {
                const wrapper = geminiApiKeyInput.closest('.api-key-input-wrapper');
                if (geminiApiKeyInput.type === 'password') {
                    geminiApiKeyInput.type = 'text';
                    wrapper.classList.add('show-key');
                    toggleApiKeyBtn.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
                } else {
                    geminiApiKeyInput.type = 'password';
                    wrapper.classList.remove('show-key');
                    toggleApiKeyBtn.innerHTML = '<i class="fa-solid fa-eye"></i>';
                }
            });
        }

        const stepsText = {
            1: "Reading resume file...",
            2: "Analyzing structure and semantics...",
            3: "Mapping skills and experiences...",
            4: "Regenerating page layouts..."
        };

        const setOverlayStep = (stepNumber, status) => {
            const stepEl = document.getElementById(`status-step-${stepNumber}`);
            if (!stepEl) return;

            if (status === 'active') {
                stepEl.className = 'status-item';
                stepEl.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> ${stepsText[stepNumber]}`;
            } else if (status === 'completed') {
                stepEl.className = 'status-item completed';
                stepEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${stepsText[stepNumber]}`;
            } else if (status === 'pending') {
                stepEl.className = 'status-item pending';
                stepEl.innerHTML = `<i class="fa-regular fa-circle"></i> ${stepsText[stepNumber]}`;
            }
        };

        const createProjectCard = (project, index) => {
            const imageIndex = (index % 3) + 1;
            const tagsHTML = (project.tags || [])
                .map(tag => `<span class="tag">${tag}</span>`)
                .join('');

            return `
                <article class="project-card">
                    <div class="project-image-wrapper">
                        <img src="assets/project${imageIndex}.png" alt="${project.title} Mockup" class="project-image" loading="lazy">
                        <div class="project-overlay">
                            <a href="${project.codeLink || 'https://github.com/'}" target="_blank" rel="noopener noreferrer" class="project-overlay-link" aria-label="View source code on GitHub">
                                <i class="fa-brands fa-github"></i>
                            </a>
                            <a href="${project.demoLink || 'https://example.com/'}" target="_blank" rel="noopener noreferrer" class="project-overlay-link" aria-label="View live project demo">
                                <i class="fa-solid fa-arrow-up-right-from-square"></i>
                            </a>
                        </div>
                    </div>
                    <div class="project-info">
                        <div class="project-tags">
                            ${tagsHTML}
                        </div>
                        <h3 class="project-title">${project.title}</h3>
                        <p class="project-description">${project.description}</p>
                        <div class="project-actions">
                            <a href="${project.codeLink || 'https://github.com/'}" target="_blank" rel="noopener noreferrer" class="project-btn-link"><i class="fa-brands fa-github"></i> Code</a>
                            <a href="${project.demoLink || 'https://example.com/'}" target="_blank" rel="noopener noreferrer" class="project-btn-link"><i class="fa-solid fa-arrow-up-right-from-square"></i> Demo</a>
                        </div>
                    </div>
                </article>
            `;
        };

        const createTimelineItem = (item, index) => {
            const isLeft = index % 2 === 0;
            const itemClass = isLeft ? 'timeline-left' : 'timeline-right';
            const iconClass = (item.title || '').toLowerCase().includes('student') || 
                              (item.title || '').toLowerCase().includes('degree') || 
                              (item.title || '').toLowerCase().includes('university') || 
                              (item.title || '').toLowerCase().includes('college') || 
                              (item.title || '').toLowerCase().includes('education') || 
                              (item.title || '').toLowerCase().includes('school')
                ? 'fa-graduation-cap' 
                : 'fa-briefcase';

            return `
                <div class="timeline-item ${itemClass}">
                    <div class="timeline-dot"><i class="fa-solid ${iconClass}"></i></div>
                    <div class="timeline-content">
                        <span class="timeline-date">${item.date}</span>
                        <h3 class="timeline-title">${item.title}</h3>
                        <span class="timeline-subtitle">${item.company}</span>
                        <p class="timeline-desc">${item.description}</p>
                    </div>
                </div>
            `;
        };

        const createSkillItem = (skill) => {
            const percentage = skill.percentage || '80%';
            return `
                <div class="skill-item">
                    <div class="skill-info">
                        <span class="skill-name">${skill.name}</span>
                        <span class="skill-percentage">${percentage}</span>
                    </div>
                    <div class="skill-bar-container">
                        <div class="skill-bar" data-progress="${percentage}" style="width: ${percentage}"></div>
                    </div>
                </div>
            `;
        };

        const createToolTag = (tool) => {
            let iconHTML = '<i class="fa-solid fa-terminal"></i>';
            const lowerTool = tool.toLowerCase();
            if (lowerTool.includes('git')) iconHTML = '<i class="fa-brands fa-git-alt"></i>';
            else if (lowerTool.includes('docker')) iconHTML = '<i class="fa-brands fa-docker"></i>';
            else if (lowerTool.includes('figma')) iconHTML = '<i class="fa-brands fa-figma"></i>';
            else if (lowerTool.includes('aws') || lowerTool.includes('amazon')) iconHTML = '<i class="fa-brands fa-aws"></i>';
            else if (lowerTool.includes('react') || lowerTool.includes('vue') || lowerTool.includes('angular') || lowerTool.includes('next')) iconHTML = '<i class="fa-brands fa-react"></i>';
            else if (lowerTool.includes('python')) iconHTML = '<i class="fa-brands fa-python"></i>';
            else if (lowerTool.includes('node')) iconHTML = '<i class="fa-brands fa-node-js"></i>';
            else if (lowerTool.includes('js') || lowerTool.includes('javascript')) iconHTML = '<i class="fa-brands fa-js"></i>';
            else if (lowerTool.includes('css')) iconHTML = '<i class="fa-brands fa-css3-alt"></i>';
            else if (lowerTool.includes('html')) iconHTML = '<i class="fa-brands fa-html5"></i>';
            else if (lowerTool.includes('database') || lowerTool.includes('sql') || lowerTool.includes('mongo')) iconHTML = '<i class="fa-solid fa-database"></i>';

            return `<span class="skill-tag">${iconHTML} ${tool}</span>`;
        };

        const normalizeText = (text) => text.replace(/\r/g, '').replace(/\s+/g, ' ').trim();

        const extractName = (text) => {
            const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
            const candidates = lines.filter((line) => {
                const words = line.split(/\s+/).filter(Boolean);
                return words.length >= 2 && words.length <= 4 && !/resume|cv|summary|objective|skills|experience|education|contact|portfolio/i.test(line) && /^[A-Za-z .,'-]+$/.test(line);
            });
            return candidates[0] || 'Your Name';
        };

        const extractRole = (text) => {
            const roleMatch = text.match(/(?:full[- ]stack|front[- ]end|back[- ]end|software|web|ui\/ux|product|data|mobile|developer|engineer|designer|analyst|manager|architect|specialist)/i);
            const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
            const roleLine = lines.find((line) => /developer|engineer|designer|analyst|manager|architect|specialist/i.test(line));
            return roleLine || (roleMatch ? roleMatch[0] : 'Professional');
        };

        const extractSummary = (text) => {
            const summaryMatch = text.match(/(?:summary|objective|profile|about)\s*[:\-]?\s*(.+)/i);
            if (summaryMatch) {
                return summaryMatch[1].trim();
            }
            const paragraphs = text.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
            return paragraphs[0] ? normalizeText(paragraphs[0]) : 'A results-driven professional with experience delivering thoughtful digital products and reliable execution.';
        };

        const extractSkills = (text) => {
            const sections = text.split(/\n+/);
            const skillsSection = sections.find((section) => /skills|core competencies|technical skills|technologies/i.test(section));
            if (!skillsSection) {
                return ['Web Development', 'UI/UX', 'Problem Solving'];
            }

            const skillsText = sections.slice(sections.indexOf(skillsSection) + 1, sections.indexOf(skillsSection) + 8).join(' ');
            const extracted = skillsText
                .split(/[,;•|\n]/)
                .map((item) => item.trim())
                .filter((item) => item && item.length > 2 && !/experience|education|contact|summary|objective/i.test(item));

            return extracted.length ? extracted.slice(0, 8) : ['Web Development', 'UI/UX', 'Problem Solving'];
        };

        const extractExperience = (text) => {
            const experienceMatch = text.match(/(?:experience|work experience)\s*[:\-]?\s*(.+)/i);
            return experienceMatch ? experienceMatch[1].trim() : 'Built and shipped projects across product, design, and engineering teams with measurable impact.';
        };

        const parseResumeText = async (file) => {
            if (!file) {
                return '';
            }

            if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                if (!window.pdfjsLib) {
                    throw new Error('PDF parsing is not available in this browser.');
                }

                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                let extractedText = '';

                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
                    const page = await pdf.getPage(pageNum);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map((item) => item.str).join(' ');
                    extractedText += `\n${pageText}`;
                }

                return extractedText;
            }

            return file.text();
        };

        // Complete DOM Updater Logic
        const updatePortfolioDOM = (data) => {
            const safelySet = (id, property, value) => {
                const el = document.getElementById(id);
                if (el) {
                    el[property] = value;
                }
            };

            // 1. Title & Brand Header Logos
            document.title = `${data.name} | Professional Portfolio`;
            const headerLogo = document.getElementById('header-logo');
            if (headerLogo) {
                headerLogo.innerHTML = `<span class="logo-dot"></span>${data.name.split(' ')[0].toLowerCase()}.dev`;
            }
            const footerLogo = document.getElementById('footer-logo');
            if (footerLogo) {
                footerLogo.innerHTML = `<span class="logo-dot"></span>${data.name.split(' ')[0].toLowerCase()}.dev`;
            }

            // 2. Hero Section
            safelySet('hero-name', 'textContent', data.name);
            safelySet('hero-description', 'textContent', data.description);
            if (data.roles && data.roles.length > 0) {
                window.typewriterWords = data.roles;
            }

            // 3. About Section
            safelySet('about-heading', 'textContent', data.aboutHeading);
            const aboutTextContainer = document.getElementById('about-text-container');
            if (aboutTextContainer && data.aboutText) {
                aboutTextContainer.innerHTML = data.aboutText
                    .map(para => `<p class="about-text">${para}</p>`)
                    .join('');
            }
            if (data.stats) {
                safelySet('stat-projects', 'textContent', data.stats.projectsCount || '10+');
                safelySet('stat-clients', 'textContent', data.stats.clientsCount || '5+');
                safelySet('stat-success', 'textContent', data.stats.successRate || '99%');
            }

            // 4. Skills lists
            const languagesList = document.getElementById('skills-languages-list');
            if (languagesList && data.skills?.languages) {
                languagesList.innerHTML = data.skills.languages.map(createSkillItem).join('');
            }
            const frameworksList = document.getElementById('skills-frameworks-list');
            if (frameworksList && data.skills?.frameworks) {
                frameworksList.innerHTML = data.skills.frameworks.map(createSkillItem).join('');
            }
            const toolsCloud = document.getElementById('skills-tools-cloud');
            if (toolsCloud && data.skills?.tools) {
                toolsCloud.innerHTML = data.skills.tools.map(createToolTag).join('');
            }

            // 5. Projects
            const projectsGrid = document.getElementById('projects-grid');
            if (projectsGrid && data.projects) {
                projectsGrid.innerHTML = data.projects.map(createProjectCard).join('');
            }

            // 6. Experience Timeline
            const experienceTimeline = document.getElementById('experience-timeline');
            if (experienceTimeline && data.experience) {
                const experienceHTML = data.experience.map(createTimelineItem).join('');
                experienceTimeline.innerHTML = `<div class="timeline-line"></div>${experienceHTML}`;
            }

            // 7. Contact Info
            safelySet('contact-info-heading', 'textContent', `Connect with ${data.name.split(' ')[0]}`);
            safelySet('contact-info-desc', 'textContent', `Looking to collaborate, hire, or discuss tech options? Feel free to reach out to ${data.name.split(' ')[0]} directly!`);
            
            const contactEmail = document.getElementById('contact-email');
            if (contactEmail && data.contact?.email) {
                contactEmail.textContent = data.contact.email;
                contactEmail.setAttribute('href', `mailto:${data.contact.email}`);
            }
            safelySet('contact-location', 'textContent', data.contact?.location || 'San Francisco, CA');

            const contactSocials = document.getElementById('contact-socials');
            if (contactSocials && data.contact?.socials) {
                const socials = data.contact.socials;
                contactSocials.innerHTML = `
                    ${socials.github ? `<a href="${socials.github}" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><i class="fa-brands fa-github"></i></a>` : ''}
                    ${socials.linkedin ? `<a href="${socials.linkedin}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>` : ''}
                    ${socials.twitter ? `<a href="${socials.twitter}" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><i class="fa-brands fa-twitter"></i></a>` : ''}
                `;
            }

            // 8. Footer Attributions
            safelySet('footer-tagline', 'textContent', `Building professional systems with impact for ${data.name}.`);
            safelySet('footer-copyright', 'innerHTML', `&copy; ${new Date().getFullYear()} ${data.name}. All rights reserved.`);
        };

        const callGeminiAPI = async (resumeText, apiKey) => {
            const systemPrompt = `You are an expert AI resume-to-portfolio mapper. 
Analyze the provided resume and return a highly detailed, clean JSON object matching the portfolio structure.
Do not wrap it in markdown code blocks like \`\`\`json. Return ONLY the raw JSON string.

Strict JSON Schema to return:
{
  "name": "Full Name",
  "roles": ["List of 3-4 professional titles or descriptors"],
  "description": "Engaging tagline description (1-2 sentences) for the hero section",
  "aboutHeading": "A short, catchy headline for the About section",
  "aboutText": ["Paragraph 1 explaining background", "Paragraph 2 explaining tech interests / hobbies"],
  "stats": {
    "projectsCount": "A realistic string like '10+' or '25+'",
    "clientsCount": "A realistic string like '5+' or '15+'",
    "successRate": "A percentage like '95%' or '99%'"
  },
  "skills": {
    "languages": [{"name": "Lang name", "percentage": "percentage (e.g. 90%)"}],
    "frameworks": [{"name": "Framework name", "percentage": "percentage (e.g. 85%)"}],
    "tools": ["Tool1", "Tool2", "Tool3", "Tool4", "Tool5", "Tool6"]
  },
  "projects": [
    {
      "title": "Title",
      "tags": ["React", "Node", "etc"],
      "description": "Detailed description of what it is and what was built (2 sentences)",
      "codeLink": "GitHub URL",
      "demoLink": "Live URL"
    }
  ],
  "experience": [
    {
      "date": "Timeline (e.g. 2023 - Present)",
      "title": "Job Title or Degree",
      "company": "Company / School Name",
      "description": "Summary of key achievements, specialization or projects"
    }
  ],
  "contact": {
    "email": "email address",
    "location": "City, State, Country",
    "socials": {
      "github": "GitHub profile URL",
      "linkedin": "LinkedIn profile URL",
      "twitter": "Twitter profile URL"
    }
  }
}`;

            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
            const payload = {
                contents: [
                    {
                        role: "user",
                        parts: [
                            { text: systemPrompt },
                            { text: `Here is the resume content:\n\n${resumeText}` }
                        ]
                    }
                ],
                generationConfig: {
                    responseMimeType: "application/json"
                }
            };

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || "Failed to contact Gemini API");
            }

            const data = await response.json();
            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!rawText) {
                throw new Error("Empty response from Gemini AI");
            }
            return JSON.parse(rawText.trim());
        };

        const parseResumeTextHeuristics = (text) => {
            const cleanedText = text || 'Full-Stack Developer with experience building polished digital products.';
            const portfolioName = extractName(cleanedText);
            const portfolioRole = extractRole(cleanedText);
            const portfolioSummary = extractSummary(cleanedText);
            const portfolioSkills = extractSkills(cleanedText);
            const portfolioExperience = extractExperience(cleanedText);

            const roles = [portfolioRole, 'Developer', 'Designer', 'Problem Solver'];
            
            const languagesList = [];
            const frameworksList = [];
            const toolsList = [];

            portfolioSkills.forEach((skill, index) => {
                const percentage = `${95 - (index * 5)}%`;
                if (index < 3) {
                    languagesList.push({ name: skill, percentage });
                } else if (index < 6) {
                    frameworksList.push({ name: skill, percentage });
                } else {
                    toolsList.push(skill);
                }
            });

            if (languagesList.length === 0) {
                languagesList.push({ name: 'HTML5 & CSS3', percentage: '95%' });
                languagesList.push({ name: 'JavaScript', percentage: '90%' });
            }
            if (frameworksList.length === 0) {
                frameworksList.push({ name: 'React.js', percentage: '85%' });
                frameworksList.push({ name: 'Node.js', percentage: '80%' });
            }
            if (toolsList.length === 0) {
                toolsList.push('Git', 'VS Code', 'Webpack');
            }

            const emailMatch = cleanedText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
            const email = emailMatch ? emailMatch[0] : 'hello@example.com';

            const locationMatch = cleanedText.match(/(?:San Francisco|New York|London|Paris|Tokyo|Berlin|Toronto|Mumbai|Sydney|California|Texas|Chicago|San Jose|Los Angeles)/i);
            const location = locationMatch ? locationMatch[0] + ', USA' : 'San Francisco, CA';

            const expItems = [];
            const paragraphs = cleanedText.split(/\n\s*\n/).filter(p => p.length > 50);
            paragraphs.slice(1, 4).forEach((para, idx) => {
                const firstLine = para.split('\n')[0].trim();
                expItems.push({
                    date: (2025 - idx) + ' - ' + (idx === 0 ? 'Present' : (2026 - idx)),
                    title: firstLine.length < 50 ? firstLine : 'Software Engineer',
                    company: 'Organization ' + (idx + 1),
                    description: para.length > 200 ? para.substring(0, 200) + '...' : para
                });
            });

            if (expItems.length === 0) {
                expItems.push({
                    date: '2023 - Present',
                    title: portfolioRole,
                    company: 'Tech Solutions Inc.',
                    description: portfolioExperience
                });
            }

            const projItems = [
                {
                    title: 'Personal Portfolio Platform',
                    tags: ['HTML5', 'CSS3', 'JavaScript'],
                    description: 'A responsive digital portfolio built dynamically from uploaded user resumes, supporting rich animations and light/dark templates.',
                    codeLink: 'https://github.com/',
                    demoLink: 'https://example.com/'
                },
                {
                    title: 'Smart Resume Parser API',
                    tags: ['Node.js', 'Express', 'Gemini AI'],
                    description: 'Microservice utilizing Google Gemini models to parse unstructured CV documents into highly formatted developer profile representations.',
                    codeLink: 'https://github.com/',
                    demoLink: 'https://example.com/'
                }
            ];

            return {
                name: portfolioName,
                roles: roles,
                description: portfolioSummary,
                aboutHeading: `Hello, I am ${portfolioName}`,
                aboutText: [portfolioSummary, "I am committed to designing high-performance interfaces and clean architectural components that solve real-world problems."],
                stats: {
                    projectsCount: '15+',
                    clientsCount: '5+',
                    successRate: '98%'
                },
                skills: {
                    languages: languagesList,
                    frameworks: frameworksList,
                    tools: toolsList
                },
                projects: projItems,
                experience: expItems,
                contact: {
                    email: email,
                    location: location,
                    socials: {
                        github: 'https://github.com/',
                        linkedin: 'https://linkedin.com/',
                        twitter: 'https://twitter.com/'
                    }
                }
            };
        };

        const renderPortfolioPreviewCard = (data) => {
            generatedName.textContent = data.name;
            generatedRole.textContent = data.roles?.[0] || 'Professional';
            generatedSummary.textContent = data.description;
            
            const exp = data.experience?.[0];
            generatedExperience.textContent = exp ? `${exp.title} at ${exp.company} (${exp.date})` : 'Experience snapshot logged.';
            
            const languages = (data.skills?.languages || []).map(l => l.name);
            const frameworks = (data.skills?.frameworks || []).map(f => f.name);
            const allSkills = [...languages, ...frameworks].slice(0, 5);
            generatedSkills.innerHTML = allSkills.map((skill) => `<span class="skill-chip">${skill}</span>`).join('');
        };

        if (resumeUploadInput && resumeFileName) {
            resumeUploadInput.addEventListener('change', () => {
                const file = resumeUploadInput.files?.[0];
                if (file) {
                    resumeFileName.textContent = `Selected: ${file.name}`;
                    if (resumeUploadStatus) {
                        resumeUploadStatus.textContent = 'Resume selected. Click “Generate Portfolio” to create the preview.';
                    }
                } else {
                    resumeFileName.textContent = 'No file selected yet.';
                }
            });
        }

        generatePortfolioBtn.addEventListener('click', async () => {
            const file = resumeUploadInput?.files?.[0];
            if (!file) {
                if (resumeUploadStatus) {
                    resumeUploadStatus.textContent = 'Please choose a PDF or text resume first.';
                }
                return;
            }

            // 1. Show processing overlay
            if (processingOverlay) {
                processingOverlay.classList.add('show');
                setOverlayStep(1, 'active');
                setOverlayStep(2, 'pending');
                setOverlayStep(3, 'pending');
                setOverlayStep(4, 'pending');
            }

            try {
                // Step 1: Read text
                const resumeText = await parseResumeText(file);
                setOverlayStep(1, 'completed');
                setOverlayStep(2, 'active');

                // Step 2: Parse using AI or heuristics
                let portfolioData;
                const apiKey = geminiApiKeyInput ? geminiApiKeyInput.value.trim() : '';

                if (apiKey) {
                    portfolioData = await callGeminiAPI(resumeText, apiKey);
                } else {
                    // Simulate delay for smooth UI feedback
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    portfolioData = parseResumeTextHeuristics(resumeText);
                }
                setOverlayStep(2, 'completed');
                setOverlayStep(3, 'active');

                // Step 3: Map data items
                await new Promise(resolve => setTimeout(resolve, 800));
                setOverlayStep(3, 'completed');
                setOverlayStep(4, 'active');

                // Step 4: Apply layouts
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Add fade out
                document.body.classList.add('portfolio-fade', 'portfolio-fade-out');
                
                setTimeout(() => {
                    // Update main DOM
                    updatePortfolioDOM(portfolioData);
                    
                    // Update the sidebar preview card as well
                    renderPortfolioPreviewCard(portfolioData);

                    // Re-trigger skill-bar progress animations
                    document.querySelectorAll('.skill-bar').forEach(bar => {
                        const progress = bar.getAttribute('data-progress');
                        if (progress) {
                            bar.style.width = '0%';
                            setTimeout(() => {
                                bar.style.width = progress;
                            }, 100);
                        }
                    });

                    // Remove fade out
                    document.body.classList.remove('portfolio-fade-out');
                    setOverlayStep(4, 'completed');

                    // Hide overlay
                    setTimeout(() => {
                        if (processingOverlay) {
                            processingOverlay.classList.remove('show');
                        }
                        if (resumeUploadStatus) {
                            resumeUploadStatus.textContent = `Portfolio completely generated from ${file.name}!`;
                        }
                    }, 800);
                }, 400);

            } catch (error) {
                console.error("Resume generation failed:", error);
                if (processingOverlay) {
                    processingOverlay.classList.remove('show');
                }
                if (resumeUploadStatus) {
                    resumeUploadStatus.textContent = `Error: ${error.message || 'We could not parse that file. Please verify your API Key.'}`;
                }
            }
        });
    });

    safelyRun('Contact Form', () => {
        const contactForm = document.getElementById('contact-form');
        const formStatus = document.getElementById('form-status');
        const submitBtn = document.getElementById('submit-btn');

        if (!contactForm || !formStatus || !submitBtn) {
            return;
        }

        contactForm.addEventListener('submit', async (event) => {
            if (!contactForm.checkValidity()) {
                return;
            }

            event.preventDefault();
            const formData = new FormData(contactForm);
            const actionUrl = contactForm.getAttribute('action');

            if (!actionUrl || actionUrl.includes('YOUR_FORMSPREE_ID')) {
                formStatus.className = 'form-status error';
                formStatus.textContent = 'Oops! Formspree action ID is not configured.';
                formStatus.style.opacity = '1';
                return;
            }

            submitBtn.disabled = true;
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Sending... <i class="fa-solid fa-circle-notch fa-spin"></i>';
            formStatus.style.opacity = '0';

            try {
                const response = await fetch(actionUrl, {
                    method: 'POST',
                    body: formData,
                    headers: { Accept: 'application/json' }
                });

                if (response.ok) {
                    formStatus.className = 'form-status success';
                    formStatus.textContent = 'Thank you! Your message was sent successfully.';
                    contactForm.reset();
                } else {
                    const errorData = await response.json();
                    formStatus.className = 'form-status error';
                    formStatus.textContent = errorData.error || 'Server error occurred. Please try again.';
                }
            } catch (error) {
                formStatus.className = 'form-status error';
                formStatus.textContent = 'Network error. Please check your internet connection and try again.';
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                formStatus.style.opacity = '1';
                setTimeout(() => {
                    formStatus.style.opacity = '0';
                }, 8000);
            }
        });
    });
};

document.addEventListener('DOMContentLoaded', initPortfolioInteractions);
